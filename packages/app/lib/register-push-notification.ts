import { axios } from '@diversifiedfinance/app/lib/axios';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import Constants from 'expo-constants';

async function getNotificationPermissionStatus() {
	const status = await Notifications.getPermissionsAsync();
	return status.granted; // || status.ios ? status.ios.status === 3 : false;
}

async function registerForPushNotificationsAsync() {
	if (!Device.isDevice) {
		return;
	}

	// On Android, we need to specify a channel.
	// Find out more specifics in the expo-notifications documentation
	if (Platform.OS === 'android') {
		Notifications.setNotificationChannelAsync('default', {
			name: 'default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: colors.diversifiedOrangeFrom,
		});
		Notifications.setNotificationChannelAsync(
			'intercom_chat_replies_channel',
			{
				name: 'Intercom Replies Channel',
				description: 'Channel for intercom replies',
				importance: Notifications.AndroidImportance.MAX,
			}
		);
	}

	const projectId = Constants.expoConfig.extra.eas.projectId;

	let granted = await getNotificationPermissionStatus();

	// Only ask if permissions have not already been determined, because
	// iOS won't necessarily prompt the user a second time.
	if (!granted) {
		// Android remote notification permissions are granted during the app
		// install, so this will only ask on iOS
		const status = await Notifications.requestPermissionsAsync({
			ios: {
				allowAlert: true,
				allowBadge: true,
				allowSound: true,
				allowAnnouncements: true,
			},
		});
		granted = status.granted;
	}

	// Stop here if the user did not grant permissions
	if (!granted) {
		return;
	}

	// Get the device token. Can be used with another push notification service
	const devicePushToken = await Notifications.getDevicePushTokenAsync();

	if (devicePushToken.type === Platform.OS) {
		// Save the device token to the database
		await axios({
			url: `/api/notifications/device/token`,
			method: 'POST',
			data: {
				platform: devicePushToken.type,
				token: devicePushToken.data,
			},
		});
	}

	// Get the expo token
	const expoPushToken = await Notifications.getExpoPushTokenAsync({
		projectId,
		devicePushToken,
	});

	// Save the expo token to the database
	await axios({
		url: `/api/notifications/device/token`,
		method: 'POST',
		data: {
			platform: 'expo',
			token: expoPushToken.data,
		},
	});
}

export { registerForPushNotificationsAsync };
