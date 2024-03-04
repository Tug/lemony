import './script-setup';
import {
	broadcastNotification,
	dispatchNotification,
	sendPendingNotifications,
} from '../src/lib/notifications';
import {
	PushNotificationKey,
	pushNotificationTypes,
} from '@diversifiedfinance/app/components/settings/notifications/constants';

export default async function run({
	pending,
	userId,
	broadcast,
	labelsAll,
	labelsNone,
	labelsAny,
	notificationType = 'marketing_general',
	description,
	content,
	fakeRun,
	sendMode,
}: {
	pending: boolean;
	userId: string;
	broadcast: boolean;
	labelsAll: string;
	labelsNone: string;
	labelsAny: string;
	notificationType?: PushNotificationKey;
	description: string;
	content: string;
	fakeRun: boolean;
	sendMode: 'all-devices' | 'last-device';
}) {
	if (pending) {
		await sendPendingNotifications();
		return;
	}
	if (!pushNotificationTypes.includes(notificationType)) {
		throw new Error('notificationType is not valid');
	}
	const contentJSON = content
		? JSON.parse(content)
		: {
				description,
		  };
	const notification = {
		recipientId: userId,
		type: notificationType,
		content: contentJSON,
	};
	if (broadcast) {
		await broadcastNotification(
			notification,
			{
				...(labelsAny && {
					OR: labelsAny.split(',').map((id) => ({
						labels: {
							some: {
								label: {
									equals: id,
								},
							},
						},
					})),
				}),
				AND: [
					...(labelsAll
						? labelsAll.split(',').map((id) => ({
								labels: {
									some: {
										label: {
											equals: id,
										},
									},
								},
						  }))
						: []),
					...(labelsNone
						? labelsNone.split(',').map((id) => ({
								labels: {
									none: {
										label: {
											equals: id,
										},
									},
								},
						  }))
						: []),
				],
			},
			{ fakeRun }
		);
	} else if (userId) {
		await dispatchNotification(notification, { fakeRun });
	}
	if (!fakeRun) {
		await sendPendingNotifications({ mode: sendMode });
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('pending', {
			type: 'boolean',
			description: 'Only send pending notifications',
		})
		.option('userId', {
			type: 'string',
			description: 'Id of the user',
		})
		.option('broadcast', {
			type: 'boolean',
			description: 'Whether to send to everyone or not',
		})
		.option('labels', {
			type: 'string',
			description: 'labels to filter the broadcast with',
		})
		.option('notLabels', {
			type: 'string',
			description: 'labels to filter out the broadcast with',
		})
		.option('notificationType', {
			type: 'string',
			description: `Notification type to send: ${pushNotificationTypes.join(
				', '
			)}`,
		})
		.option('description', {
			type: 'string',
			description: 'Notification description',
		})
		.option('content', {
			type: 'string',
			description: 'Notification description',
		})
		.option('fakeRun', {
			type: 'boolean',
			description: 'Test run or real run',
		}).argv;
	run(args);
}
