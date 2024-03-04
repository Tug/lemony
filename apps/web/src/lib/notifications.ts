import {
	Prisma,
	prisma,
	SchemaTypes,
	transactionWithRetry,
	updateMulti,
} from './prismadb';
import type { NotificationType } from '@diversifiedfinance/types/diversified';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { pushNotificationTypes } from '@diversifiedfinance/app/components/settings/notifications/constants';
import { addI18nResource, getI18nServerInstance } from './i18n';
import { NOTIFICATION_TYPE_COPY } from '@diversifiedfinance/app/components/notifications/copies';

export const expoClient = new Expo({
	accessToken: process.env.EXPO_ACCESS_TOKEN,
});

export function toPublicNotifications(
	dbNotification: SchemaTypes.Notification
): NotificationType {
	return {
		id: dbNotification.id,
		visibleAt: dbNotification.visibleAt,
		imgUrl: dbNotification.imgUrl,
		content: dbNotification.content,
		type: dbNotification.type,
		author: {
			id: dbNotification.authorId,
		},
	};
}

export async function getNotificationDescription(
	notification: SchemaTypes.Notification & { locale: string }
) {
	const i18n = await getI18nServerInstance(notification.locale, 'app');
	if (notification.content?.description) {
		return i18n.t(
			notification.content?.description,
			notification.content?.vars
		);
	}
	return NOTIFICATION_TYPE_COPY[notification.type]?.(
		notification.content,
		i18n.t
	);
}

export async function sendForTranslation(notification) {
	if (process.env.CI) {
		return;
	}
	if (typeof notification.content !== 'object') {
		return;
	}
	const i18n = await getI18nServerInstance('fr', 'app');
	for (const [key, value] of Object.entries(notification.content ?? {})) {
		if (
			!['project', 'user', 'prices'].includes(key) &&
			typeof value === 'string' &&
			i18n.t(value) !== value
		) {
			await addI18nResource(i18n, 'en', value, value);
		}
	}
}

function fixNotification(
	notification: SchemaTypes.NotificationUncheckedCreateInput
): SchemaTypes.NotificationUncheckedCreateInput {
	// carousel notifications are broken in v13
	// as they import a `comment` icon which is broken
	// setting another icon fixes it
	if (notification.type === 'special_home_carousel') {
		if (
			!notification.content.icon ||
			notification.content.icon === 'comment'
		) {
			return {
				...notification,
				content: {
					...notification.content,
					icon: 'casino-chip',
				},
			};
		}
	}
	return notification;
}

export async function dispatchNotification(
	notification: SchemaTypes.NotificationUncheckedCreateInput,
	{
		translate = true,
		fakeRun = false,
	}: { translate?: boolean; fakeRun?: boolean } = {},
	tx: Prisma.TransactionClient = prisma
) {
	if (translate) {
		await sendForTranslation(notification);
	}
	if (!fakeRun) {
		await tx.notification.create({
			data: fixNotification({
				visibleAt: notification.visibleAt ?? new Date(),
				...notification,
			}),
		});
	}
}

export async function broadcastNotification(
	notification: SchemaTypes.NotificationUncheckedCreateInput,
	userWhereInput: SchemaTypes.UserWhereInput = {},
	{ fakeRun = false }: { fakeRun?: boolean } = {}
) {
	await sendForTranslation(notification);
	// TODO: monitor this and handle scenario when
	//  there are too many users to broadcast at once
	const users = await prisma.user.findMany({
		where: {
			disabled: false,
			...userWhereInput,
		},
		select: {
			id: true,
		},
	});
	console.log(`Broadcasting to ${users.length} users`);
	if (fakeRun) {
		return;
	}
	await prisma.notification.createMany({
		data: users
			.map((user) => ({
				visibleAt: new Date(),
				...notification,
				recipientId: user.id,
			}))
			.map(fixNotification),
	});
}

export async function sendPendingNotifications({
	batchSize = 1000,
}: {
	batchSize?: number;
} = {}): Promise<void> {
	// don't send outdated notifications
	await prisma.$queryRaw`
		UPDATE notifications
		SET status = 'errored'
		WHERE status = 'pending' AND "visibleAt" < NOW() - INTERVAL '1 day'
	`;
	const isSending = Boolean(
		await prisma.notification.findFirst({
			where: {
				visibleAt: {
					// should be self-healing after some time
					gte: new Date(Date.now() - 1000 * 60 * 5),
				},
				status: 'sending',
			},
		})
	);
	if (isSending) {
		throw new Error(
			'Another process is likely already sending notifications'
		);
	}
	// TODO NEXT: handle multiple devices per user
	//  This is not trivial as we need to set the receipt status to only one
	//  notification row in the notifications table. This could use a model change
	//  (use a JSON receiptIds instead for instance)
	//  for now we just take the latest updated token,
	//  and deduplicate for each token (different users can have the
	//  same token when generated from the same device)
	const notifications = await prisma.$queryRaw`
		WITH unique_devicetokens AS (
			WITH all_devicetokens AS (
				 SELECT
					 "userId",
					 "token",
					 "updatedAt",
					 "platform",
					 ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "updatedAt" DESC) AS user_rank,
					 ROW_NUMBER() OVER (PARTITION BY "token" ORDER BY "updatedAt" DESC) AS token_rank
				 FROM devicetokens
				 WHERE platform = 'expo'
			)
			SELECT * FROM all_devicetokens where user_rank = 1 AND token_rank = 1
		),
		notifications_with_token AS (
			SELECT
				n.*,
				u.id as "userId",
				udt."token" as token,
				pref.enabled as "pushEnabled",
				u.locale,
				u.settings as "userSettings"
			FROM notifications n
			INNER JOIN unique_devicetokens udt ON n."recipientId" = udt."userId"
			INNER JOIN users u ON udt."userId" = u.id
			LEFT JOIN notificationpreferences pref ON u.id = pref."userId" AND n.type = pref."notificationType"
			WHERE n.status = 'pending' AND n."visibleAt" <= NOW() AND pref.enabled = true AND udt.token IS NOT NULL
			LIMIT ${batchSize}
		)
		SELECT * FROM notifications_with_token;
	`;
	const messages = [];
	for (const notification of notifications) {
		notification.locale =
			notification.userSettings?.preferences?.locale ??
			notification.locale;
		// Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
		const body = await getNotificationDescription(notification);
		messages.push({
			id: notification.id,
			to: notification.token,
			sound: 'default',
			body,
			data: {
				notificationId: notification.id,
				notificationType: notification.type,
				notificationLocale: notification.locale,
				utm_source: 'server',
				utm_medium: 'push',
				utm_campaign: 'server',
				// vars: notification.content?.vars,
			},
		});
	}
	if (messages.length === 0) {
		return;
	}
	await prisma.$queryRaw`
		UPDATE notifications
		SET status = 'sending'
		WHERE id IN (${Prisma.join(messages.map(({ id }) => id))})
	`;
	await sendPushNotifications(messages);
	// Take the non-matching rows and set them to muted
	await prisma.$queryRaw`
		WITH duplicate_devicetokens AS (
			WITH all_devicetokens AS (
				SELECT
					"userId",
					"token",
					"updatedAt",
					"platform",
					ROW_NUMBER() OVER (PARTITION BY "token" ORDER BY "updatedAt" DESC) AS token_rank
				FROM devicetokens
				WHERE platform = 'expo'
			)
			SELECT * FROM all_devicetokens where token_rank != 1
		)
		UPDATE notifications
		SET status = 'muted'
		FROM notifications n
		LEFT JOIN duplicate_devicetokens ddt ON n."recipientId" = ddt."userId"
		INNER JOIN users u ON n."recipientId" = u.id
		LEFT JOIN notificationpreferences pref ON u.id = pref."userId" AND n.type = pref."notificationType"
		WHERE n.status = 'pending' AND n."visibleAt" <= NOW() AND (pref.enabled = false OR ddt.token IS NOT NULL)
		LIMIT ${batchSize}
	`;
	await prisma.$queryRaw`
		UPDATE notifications
		SET status = 'errored'
		WHERE status = 'sending'
	`;
	// We can test that the intersection of the two queries is empty with:
	// (it's actually returning the notifications that were duplicates)
	// WITH unique_devicetokens AS (
	// 	WITH all_devicetokens AS (
	// 		 SELECT
	// 			 "userId",
	// 			 "token",
	// 			 "updatedAt",
	// 			 "platform",
	// 			 ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "updatedAt" DESC) AS user_rank,
	// 			 ROW_NUMBER() OVER (PARTITION BY "token" ORDER BY "updatedAt" DESC) AS token_rank
	// 		 FROM devicetokens
	// 		 WHERE platform = 'expo'
	// 	)
	// 	SELECT * FROM all_devicetokens where user_rank = 1 AND token_rank = 1
	// ),
	// notifications_with_token AS (
	// 	SELECT
	// 		u.id as "userId",
	// 		n.*,
	// 		udt."token" as token,
	// 		pref.enabled as "pushEnabled",
	// 		u.locale,
	// 		u.settings as "userSettings"
	// 	FROM notifications n
	// 	INNER JOIN unique_devicetokens udt ON n."recipientId" = udt."userId"
	// 	INNER JOIN users u ON udt."userId" = u.id
	// 	LEFT JOIN notificationpreferences pref ON u.id = pref."userId" AND n.type = pref."notificationType"
	// 	WHERE pref.enabled = true AND udt.token IS NOT NULL
	// 	LIMIT 1000
	// ),
	// duplicate_devicetokens AS (
	// 	WITH all_devicetokens AS (
	// 		SELECT
	// 			"userId",
	// 			"token",
	// 			"updatedAt",
	// 			"platform",
	// 			ROW_NUMBER() OVER (PARTITION BY "token" ORDER BY "updatedAt" DESC) AS token_rank
	// 		FROM devicetokens
	// 		WHERE platform = 'expo'
	// 	)
	// 	SELECT * FROM all_devicetokens where token_rank != 1
	// ),
	// notifications_duplicate AS (
	// 	SELECT n.*
	// 	FROM notifications n
	// 	INNER JOIN users u ON n."recipientId" = u.id
	// 	LEFT JOIN duplicate_devicetokens ddt ON n."recipientId" = ddt."userId"
	// 	LEFT JOIN notificationpreferences pref ON u.id = pref."userId" AND n.type = pref."notificationType"
	// 	WHERE (pref.enabled = false OR ddt.token IS NOT NULL)
	// 	LIMIT 1000
	// )
	// SELECT * from notifications_with_token nwt join notifications_duplicate nd on nwt.id = nd.id
}

export async function sendPushNotifications(
	messages: Array<{
		id: string;
		to: string;
		sound: 'default';
		body: string;
		data: any;
	}>
) {
	const filteredMessages: Array<ExpoPushMessage & { id: string }> =
		messages.filter((message) => {
			// Check that all your push tokens appear to be valid Expo push tokens
			if (!Expo.isExpoPushToken(message.to)) {
				console.error(
					`Push token ${message.to} is not a valid Expo push token`
				);
				return false;
			}
			return true;
		});
	// The Expo push notification service accepts batches of notifications so
	// that you don't need to send 1000 requests to send 1000 notifications. We
	// recommend you batch your notifications to reduce the number of requests
	// and to compress them (notifications with similar content will get
	// compressed).
	const chunks = expoClient.chunkPushNotifications(filteredMessages);
	// const tickets = [];
	// Send the chunks to the Expo push notification service. There are
	// different strategies you could use. A simple one is to send one chunk at a
	// time, which nicely spreads the load out over time:
	for (const chunk of chunks) {
		try {
			const ticketChunk = await expoClient.sendPushNotificationsAsync(
				chunk
			);
			// tickets.push(...ticketChunk);
			// NOTE: If a ticket contains an error code in ticket.details.error, you
			// must handle it appropriately. The error codes are listed in the Expo
			// documentation:
			// https://docs.expo.io/push-notifications/sending-notifications/#individual-errors

			await transactionWithRetry([
				updateMulti<
					[
						id: number,
						status: SchemaTypes.NotificationStatus,
						receiptId: string | null
					]
				>(
					'notifications',
					[
						['status', 'NotificationStatus'],
						['receiptId', 'string'],
					],
					chunk.map((message, index) => {
						const notificationId = (
							message as ExpoPushMessage & { id: string }
						).id;
						const ticket = ticketChunk[index];
						const status =
							!ticket || ticket.status === 'error'
								? SchemaTypes.NotificationStatus.errored
								: SchemaTypes.NotificationStatus.pushed;
						if (
							status === 'errored' &&
							ticket?.details?.fault === 'developer'
						) {
							console.error(
								`Error sending notification ${notificationId}: ${
									ticket?.details?.error ?? 'Error'
								}: ${ticket?.message ?? 'Unknown'}`
							);
						}
						const receiptId = ticket?.id ?? null;
						return [notificationId, status, receiptId];
					})
				),
			]);
		} catch (error) {
			console.error(error);
		}
	}
}

export async function initNotificationPreferences(
	userId: string,
	force = false
) {
	const hasExistingPref = Boolean(
		await prisma.notificationPreference.findFirst({
			where: {
				userId,
			},
		})
	);
	if (hasExistingPref && !force) {
		// already initialized
		return;
	}
	const hasExpoToken = Boolean(
		await prisma.deviceToken.findFirst({
			where: {
				userId,
				platform: 'expo',
			},
		})
	);
	return await prisma.notificationPreference.createMany({
		data: pushNotificationTypes
			.filter(
				(pushNotificationType) =>
					!pushNotificationType.startsWith('special_')
			)
			.map((notificationType) => ({
				userId,
				notificationType,
				enabled: hasExpoToken,
			})),
		skipDuplicates: true,
	});
}
