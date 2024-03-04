import { useCallback, useEffect, useState } from 'react';

import * as Notifications from 'expo-notifications';

import { useRouter } from '@diversifiedfinance/design-system/router';
import { useAuth } from '@diversifiedfinance/app/hooks/auth/use-auth';
import { useTranslation } from 'react-i18next';
import { atomWithUnecryptedStorage } from '@diversifiedfinance/app/lib/preferences/storage';
import { MMKV } from 'react-native-mmkv';
import { useAtom } from 'jotai';
import { Analytics, EVENTS } from '@diversifiedfinance/app/lib/analytics';
import { NotificationType } from '@diversifiedfinance/types/diversified';
import { axios } from '@diversifiedfinance/app/lib/axios';
import { Linking } from 'react-native';

const notificationsMetaStorage = new MMKV({ id: 'notifications-meta' });
export const notificationsMetaAtom = atomWithUnecryptedStorage(
	notificationsMetaStorage,
	{ unstable_getOnInit: true }
);

const freshInstallAtom = notificationsMetaAtom('fresh-install', true);
const localNotificationsScheduledAtom = notificationsMetaAtom(
	'local-notifications-scheduled',
	[]
);

const saveNotification = (
	notification: Omit<NotificationType, 'id' | 'visibleAt'>
) =>
	axios({
		url: '/api/notifications',
		method: 'PUT',
		data: notification,
	});

const getNotificationContent = (notification: Notifications.Notification) => {
	const content = notification.request.content;
	const trigger = notification.request.trigger;
	const link =
		trigger?.payload?.CIO?.push?.link ??
		trigger?.payload?.message?.body?.link;
	return {
		title: content.title,
		description: content.body,
		url: link,
		trigger,
		vars: content.data?.vars,
	};
};

export function useHandleNotification() {
	const router = useRouter();
	const [currentNotification, setCurrentNotification] =
		useState<Notifications.Notification | null>(null);
	const { authenticationStatus } = useAuth();
	const [isFreshInstall, setFreshInstall] = useAtom(freshInstallAtom);
	const [localNotificationsScheduled, setLocalNotificationsScheduled] =
		useAtom(localNotificationsScheduledAtom);
	const { t } = useTranslation();

	useEffect(() => {
		const shouldShowNotification = true;
		if (currentNotification) {
			// TODO:
			// const content = currentNotification?.request?.content?.data?.body?.path;
			// const currentScreen = '';
			// const destinationScreen = '';
			// Don't show if already on the same screen as the destination screen
			// shouldShowNotification = currentScreen !== destinationScreen;
		}

		// priority: AndroidNotificationPriority.HIGH,
		// Foreground notification handling
		Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: shouldShowNotification,
				shouldPlaySound: shouldShowNotification,
				shouldSetBadge: false, // shouldShowNotification
			}),
		});
	}, [currentNotification]);

	// Handle push notifications
	useEffect(() => {
		// Handle notifications that are received while the app is open.
		const notificationListener =
			Notifications.addNotificationReceivedListener(
				async (notification) => {
					setCurrentNotification(notification);
					// https://customer.io/docs/sdk/react-native/push-notifications/push-metrics/
					const payload = notification.request.trigger.payload;
					const data = notification.request.content.data;
					const content = getNotificationContent(notification);
					Analytics.track(EVENTS.NOTIFICATION_DELIVERED, {
						content,
						payload,
						data,
						type: data?.notificationType ?? 'marketing_general',
					});
					const isFromServer = Boolean(data?.notificationId);
					if (!isFromServer) {
						await saveNotification({
							content,
							type: data?.notificationType ?? 'marketing_general',
						});
					}
				}
			);
		const responseListener =
			Notifications.addNotificationResponseReceivedListener(
				async (response) => {
					const data = response.notification.request.content.data;
					const payload =
						response.notification.request.trigger.payload;
					const content = getNotificationContent(
						response.notification
					);
					Analytics.track(EVENTS.NOTIFICATION_OPENED, {
						data,
						content,
						payload,
						type: 'marketing_general',
					});
					if (
						content.url &&
						(await Linking.canOpenURL(content.url))
					) {
						Linking.openURL(content.url);
					} else if (authenticationStatus !== 'UNAUTHENTICATED') {
						router.push('/notifications');
					}
					Notifications.dismissNotificationAsync(
						response?.notification?.request?.identifier
					);
					Notifications.setBadgeCountAsync(0);
				}
			);

		return () => {
			Notifications.removeNotificationSubscription(notificationListener);
			Notifications.removeNotificationSubscription(responseListener);
		};
	}, [authenticationStatus]);

	useEffect(() => {
		if (authenticationStatus === 'AUTHENTICATED') {
			setFreshInstall(false);
			// TODO: revisit to support other kind of scheduled notifications
			Notifications.cancelAllScheduledNotificationsAsync();
		}
	}, [authenticationStatus, setFreshInstall]);

	// Handle local notifications
	useEffect(() => {
		(async () => {
			if (!isFreshInstall) {
				return;
			}
			if (localNotificationsScheduled.length > 0) {
				return;
			}
			const getStartedNotification = {
				content: {
					title: t(
						'One step away from amazing investment opportunities'
					),
					body: t(
						'Create your account (in 2 minutes) and access incredible investment opportunities!'
					),
				},
			};
			const localNotifications = [
				{
					id: 'new-user-1',
					visibleAt: new Date(Date.now() + 1000 * 3600), // 1h
					...getStartedNotification,
				},
				{
					id: 'new-user-2',
					visibleAt: new Date(Date.now() + 1000 * 3600 * 24 * 7), // 7 days
					...getStartedNotification,
				},
			];
			const newScheduledNotifications = [];
			for (const localNotification of localNotifications) {
				const id = await Notifications.scheduleNotificationAsync({
					identifier: localNotification.id,
					content: localNotification.content,
					trigger: localNotification.visibleAt,
				});
				newScheduledNotifications.push(id);
			}
			await setLocalNotificationsScheduled((state) =>
				Array.from(new Set([...state, ...newScheduledNotifications]))
			);
		})();
	}, []);
}
