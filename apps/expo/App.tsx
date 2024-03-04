import { growthbook } from '@diversifiedfinance/app/lib/growthbook';
import { Sentry } from '@diversifiedfinance/app/lib/sentry';
import { RootStackNavigator } from '@diversifiedfinance/app/navigation/navigators/root';
import { AppProviders } from '@diversifiedfinance/app/providers/app-providers';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Logger } from '@diversifiedfinance/app/lib/logger';
import { AppState, LogBox, Platform, View } from 'react-native';
import { AvoidSoftInput } from 'react-native-avoid-softinput';
import { enableFreeze, enableScreens } from 'react-native-screens';
import Intercom from '@intercom/intercom-react-native';
import { init as i18nInit } from '@diversifiedfinance/app/lib/i18n';
import { useExpoUpdate } from '@diversifiedfinance/app/hooks/use-expo-update';
import * as SplashScreen from 'expo-splash-screen';
import { init as analyticsInit } from '@diversifiedfinance/app/lib/analytics';

enableScreens(true);
enableFreeze(true);

SplashScreen.preventAutoHideAsync().catch(() => {
	// in very rare cases, preventAutoHideAsync can reject, this is a best effort
});

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	environment: process.env.STAGE,
	enableInExpoDevelopment: false, // true,
	debug: false, // __DEV__,
	beforeSend(event, hint) {
		// Warning: sentry can cause a crash if error is an error-like object
		// see: https://diversified.sentry.io/issues/3934046206/

		// Handle AxiosError
		if (
			hint &&
			hint.originalException &&
			hint.originalException.isAxiosError
		) {
			if (
				hint.originalException.response &&
				hint.originalException.response.data
			) {
				event.contexts = {
					...event.contexts,
					errorResponse: {
						data: hint.originalException.response.data,
					},
				};
			}
		}

		return event;
	},
});

LogBox.ignoreLogs([
	'Constants.deviceYearClass',
	'No native splash screen',
	"The provided value 'ms-stream' is not a valid 'responseType'.",
	"The provided value 'moz-chunked-arraybuffer' is not a valid 'responseType'.",
	"Constants.platform.ios.model has been deprecated in favor of expo-device's Device.modelName property.",
	'ExponentGLView',
	"[react-native-gesture-handler] Seems like you're using an old API with gesture components",
	'Sending `onAnimatedValueUpdate` with no listeners registered.', // `react-native-tab-view` waring issue.
	'Did not receive response to shouldStartLoad in time', // warning from @magic-sdk/react-native's react-native-webview dependency. https://github.com/react-native-webview/react-native-webview/issues/124
	"Looks like you're trying",
]);

i18nInit();
analyticsInit();

function App() {
	useExpoUpdate();
	const [notification, setNotification] = useState(null);

	// manually call the garbage collector every minute
	// to free up memory
	useEffect(() => {
		let timeoutId: NodeJS.Timeout;
		const scheduleGC = () => {
			timeoutId = setInterval(() => {
				setImmediate(() => {
					globalThis?.gc?.();
				});
			}, 60_000);
		};

		scheduleGC();

		return () => {
			clearInterval(timeoutId);
		};
	}, []);

	useEffect(() => {
		AvoidSoftInput.setEnabled(true);

		return () => {
			AvoidSoftInput.setEnabled(false);
		};
	}, []);

	useEffect(() => {
		// Load feature definitions from API
		fetch(process.env.GROWTHBOOK_FEATURES_ENDPOINT)
			.then((res) => res.json())
			.then((json) => {
				growthbook.setFeatures(json.features);
			})
			.catch((err) => {
				console.error(
					'Error loading Growthbook features, all features are off by default',
					err
				);
			});
	}, []);

	useEffect(() => {
		const shouldShowNotification = true;
		if (notification) {
			// TODO:
			// const content = notification?.request?.content?.data?.body?.path;
			// const currentScreen = '';
			// const destinationScreen = '';
			// Don't show if already on the same screen as the destination screen
			// shouldShowNotification = currentScreen !== destinationScreen;
		}

		// priority: AndroidNotificationPriority.HIGH,
		Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: shouldShowNotification,
				shouldPlaySound: shouldShowNotification,
				shouldSetBadge: false, // shouldShowNotification
			}),
		});
	}, [notification]);

	// Handle push notifications
	useEffect(() => {
		// Handle notifications that are received while the app is open.
		const notificationListener =
			Notifications.addNotificationReceivedListener((notification) => {
				setNotification(notification);
			});
		// a memory warning listener for free up FastImage Cache
		const memoryWarningSubscription = AppState.addEventListener(
			'memoryWarning',
			() => {
				async function clearFastImageMemory() {
					try {
						await Image.clearMemoryCache();
						Logger.log('did receive memory warning and cleared');
					} catch {}
				}
				clearFastImageMemory();
			}
		);
		/**
		 * Let intercom handle Push Notifications
		 */
		const appStateListener = AppState.addEventListener(
			'change',
			(nextAppState) =>
				nextAppState === 'active' && Intercom.handlePushMessage()
		);
		return () => {
			Notifications.removeNotificationSubscription(notificationListener);
			memoryWarningSubscription.remove();
			appStateListener.remove();
		};
	}, []);

	// Listeners registered by this method will be called whenever a user
	// interacts with a notification (eg. taps on it).
	useEffect(() => {
		const responseListener =
			Notifications.addNotificationResponseReceivedListener(
				(response) => {
					// const content =
					//   Platform.OS === "ios"
					//     ? response?.notification?.request?.content?.data?.body?.path
					//     : response?.notification?.request?.content?.data?.path;
					// Notifications.dismissNotificationAsync(
					//   response?.notification?.request?.identifier
					// );
					// Notifications.setBadgeCountAsync(0);
				}
			);

		return () =>
			Notifications.removeNotificationSubscription(responseListener);
	}, []);

	return (
		<AppProviders>
			<RootStackNavigator />
		</AppProviders>
	);
}

export default App;
