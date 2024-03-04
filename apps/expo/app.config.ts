import type { ExpoConfig } from '@expo/config-types';
import { ExportedConfigWithProps } from 'expo/config-plugins';
const { expand } = require('dotenv-expand');
const dotenv = require('dotenv');

// https://github.com/expo/expo/issues/23727
const originalLog = console.log;
console.log = () => {};

const path = require('path');
const STAGE = (process.env.STAGE = process.env.STAGE ?? 'development');

// @ts-expect-error: invalid type declaration, process is mutable in Node.js environments.
process.env.NODE_ENV = process.env.NODE_ENV ?? 'production';

const { withInfoPlist } = require('@expo/config-plugins');

type EnvConfig = {
	[key: string]: {
		scheme: string;
		icon: string;
		foregroundImage: string;
		backgroundImage: string;
	};
};
const url = process.env.NEXT_PUBLIC_WEBSITE_DOMAIN;

// TODO: remove api keys from this file as it is public
//  Eg: https://u.expo.dev/3815bb4a-ffe6-469f-9467-a574074b8f75?runtime-version=9&channel-name=staging&platform=ios

const packageJSON = require('../../package.json');

const semver = require('semver');

if (process.env.EXPO_NO_DOTENV) {
	expand(
		dotenv.config({
			path: path.join(
				__dirname,
				['./.env', process.env.STAGE].filter(Boolean).join('.')
			),
			override: true,
		})
	);
} else {
	require('@expo/env').load(__dirname);
}

console.log = originalLog;

const SCHEME = process.env.SCHEME ?? 'fi.diversified.app';

const envConfigs: EnvConfig = {
	development: {
		scheme: `${SCHEME}.development`,
		icon: './assets/images/icon.development.png',
		foregroundImage: './assets/images/adaptive-icon.png',
		backgroundImage:
			'./assets/images/adaptive-icon-background.development.png',
	},
	staging: {
		scheme: `${SCHEME}.staging`,
		icon: './assets/images/icon.staging.png',
		foregroundImage: './assets/images/adaptive-icon.png',
		backgroundImage: './assets/images/adaptive-icon-background.staging.png',
	},
	production: {
		scheme: SCHEME,
		icon: './assets/images/icon.png',
		foregroundImage: './assets/images/adaptive-icon.png',
		backgroundImage: './assets/images/adaptive-icon-background.png',
	},
};

const envConfig = envConfigs[STAGE];
const version = packageJSON.version;
const majorVersion = semver.major(version);
const androidVersionCode = majorVersion * 100 + semver.minor(version);
const googleServicesFile =
	STAGE === 'development'
		? './google-services.development.json'
		: STAGE === 'staging'
		? './google-services.staging.json'
		: STAGE === 'production'
		? './google-services.json'
		: '';

const expoConfig: ExpoConfig = {
	name: 'Diversified',
	description: 'The asset tokenization marketplace',
	slug: 'lemony-mobile',
	privacy: 'unlisted',
	scheme: envConfig.scheme,
	owner: 'diversified',
	icon: envConfig.icon,
	version: version.toString(),
	userInterfaceStyle: 'automatic',
	splash: {
		image: './assets/images/splash.png',
		resizeMode: 'contain',
		backgroundColor: '#242C89',
	},
	ios: {
		bundleIdentifier: envConfig.scheme,
		buildNumber: majorVersion.toString(),
		supportsTablet: true,
		jsEngine: 'hermes',
		backgroundColor: '#FFFFFF',
		config: {
			usesNonExemptEncryption: false,
		},
		// usesAppleSignIn: true,
		bitcode: false, // or "Debug",
		associatedDomains: [
			'applinks:app.diversified.fi',
			STAGE === 'production' && 'applinks:diversified.app.link',
			STAGE === 'production' && 'applinks:diversified-alternate.app.link',
			STAGE === 'staging' && `applinks:staging.app.diversified.fi`,
			STAGE === 'staging' && 'applinks:diversified.test-app.link',
			STAGE === 'staging' &&
				'applinks:diversified-alternate.test-app.link',
		].filter(Boolean),
		entitlements: {
			'com.apple.developer.applesignin': ['Default'],
			'com.apple.developer.in-app-payments': [
				process.env.NEXT_PUBLIC_APPLE_PAY_MERCHANT_ID,
				process.env.NEXT_PUBLIC_APPLE_PAY_MERCHANT_ID_SANDBOX,
			],
		},
	},
	android: {
		package: envConfig.scheme,
		versionCode: androidVersionCode,
		adaptiveIcon: {
			foregroundImage: envConfig.foregroundImage,
			backgroundImage: envConfig.backgroundImage,
		},
		jsEngine: 'hermes',
		softwareKeyboardLayoutMode: 'resize',
		intentFilters: [
			{
				action: 'VIEW',
				autoVerify: true,
				data: [
					{
						scheme: 'https',
						host: `*.${url}`,
						pathPrefix: '/',
					},
				],
				category: ['BROWSABLE', 'DEFAULT'],
			},
			{
				action: 'VIEW',
				category: ['BROWSABLE', 'DEFAULT'],
				data: {
					scheme: envConfig.scheme,
				},
			},
		],
		googleServicesFile,
		// useNextNotificationsApi: true,
	},
	locales: {
		en: './languages/en.json',
		fr: './languages/fr.json',
	},
	androidNavigationBar: {
		barStyle: 'dark-content',
		backgroundColor: '#FFFFFF',
	},
	androidStatusBar: {
		backgroundColor: '#FFFFFF',
		barStyle: 'dark-content',
	},
	assetBundlePatterns: ['**/*'],
	orientation: 'portrait',
	// We use the major version for the runtime version so it's in sync
	// with the native app version and should prevent us from sending an update
	// without the correct native build.
	// Learn more: https://docs.expo.dev/eas-update/runtime-versions
	runtimeVersion: majorVersion.toString(),
	extra: {
		STAGE,
		eas: {
			projectId: '3815bb4a-ffe6-469f-9467-a574074b8f75',
			build: {
				experimental: {
					ios: {
						appExtensions: [
							{
								targetName: 'NotificationService',
								bundleIdentifier: `${envConfig.scheme}.richpush`,
							},
						],
					},
				},
			},
		},
	},
	updates: {
		fallbackToCacheTimeout: 0,
		url: 'https://u.expo.dev/3815bb4a-ffe6-469f-9467-a574074b8f75',
	},
	plugins: [
		[
			'expo-media-library',
			{
				photosPermission:
					'Allow $(PRODUCT_NAME) to access your photos.',
				savePhotosPermission: 'Allow $(PRODUCT_NAME) to save photos.',
				isAccessMediaLocationEnabled: true,
			},
		],
		'expo-localization',
		[
			'expo-local-authentication',
			{
				faceIDPermission: 'Allow $(PRODUCT_NAME) to use Face ID.',
			},
		],
		[
			'expo-image-picker',
			{
				photosPermission:
					'$(PRODUCT_NAME) needs to access your camera roll so that you can upload photos on Diversified.',
			},
		],
		[
			'@config-plugins/react-native-branch',
			{
				apiKey: process.env.NEXT_PUBLIC_BRANCH_API_KEY,
				iosAppDomain: process.env.NEXT_PUBLIC_BRANCH_APP_DOMAIN,
			},
		],
		[
			'./plugins/with-pick-first.js',
			{
				paths: [
					'lib/**/libreactnativejni.so',
					'lib/**/libreact_nativemodule_core.so',
					'lib/**/libfbjni.so',
					'lib/**/libturbomodulejsijni.so',
					'lib/**/libcrypto.so',
					'lib/**/libssl.so',
				],
			},
		],
		// 'expo-apple-authentication',
		'./plugins/with-android-manifest.js',
		'./plugins/with-hermes-ios-m1-workaround.js',
		'sentry-expo',
		'./plugins/with-android-splash-screen.js',
		'./plugins/with-disabled-force-dark-mode.js',
		'./plugins/with-sumsub-react-native-mobilesdk-module.js',
		[
			withInfoPlist,
			(config: ExportedConfigWithProps) => {
				if (!config.modResults) {
					config.modResults = {};
				}
				config.modResults = {
					...config.modResults,
					// Enable 120 FPS animations
					CADisableMinimumFrameDurationOnPhone: true,
					// let RNS handle status bar management
					UIViewControllerBasedStatusBarAppearance: true,
					LSApplicationQueriesSchemes: ['mailto', 'itms-apps'],
					NSFaceIDUsageDescription:
						'We use Face ID to unlock the app.',
					NSPhotoLibraryUsageDescription:
						'Diversified requires access to your photo library in order to upload your ID documents.',
					NSCameraUsageDescription:
						'Diversified requires access to your camera in order to take pictures of your ID documents.',
					NSLocationAlwaysAndWhenInUseUsageDescription:
						'Diversified requires access to your location to secure access to your account.',
					NSLocationAlwaysUsageDescription:
						'Diversified requires access to your location to secure access to your account.',
					NSLocationWhenInUseUsageDescription:
						'Diversified requires access to your location to secure access to your account.',
					// Need to disable remote-notification otherwise permissions are
					// requested on app launch
					UIBackgroundModes: ['fetch'], //, 'remote-notification'],
					UISupportedInterfaceOrientations: [
						'UIInterfaceOrientationPortrait',
					],
					SKAdNetworkItems: [
						// facebook: https://developers.facebook.com/docs/setting-up/platform-setup/ios/SKAdNetwork
						{ SKAdNetworkIdentifier: 'v9wttpbfk9.skadnetwork' },
						{ SKAdNetworkIdentifier: 'n38lu8286q.skadnetwork' },
					],
					// NSAdvertisingAttributionReportEndpoint:
					// 	'https://branch-skan.com',
					CFBundleAllowMixedLocalizations: true,
				};
				return config;
			},
		],
		[
			'@bacons/link-assets',
			[
				'./assets/fonts/Inter-Bold.otf',
				'./assets/fonts/Inter-Medium.otf',
				'./assets/fonts/Inter-Regular.otf',
				'./assets/fonts/Inter-SemiBold.otf',
				'./assets/fonts/BrickText-Black.otf',
			],
		],
		[
			'expo-build-properties',
			{
				android: {
					compileSdkVersion: 33,
					targetSdkVersion: 33,
					minSdkVersion: 23,
					buildToolsVersion: '33.0.0',
					kotlinVersion: '1.8.10',
					unstable_networkInspector: true,
				},
				ios: {
					deploymentTarget: '13.0',
					unstable_networkInspector: true,
					// https://github.com/expo/expo/discussions/23449
					//newArchEnabled: true, // 13.4 required
				},
			},
		],
		[
			'config-plugin-react-native-intercom',
			{
				iosApiKey: process.env.INTERCOM_IOS_API_KEY,
				androidApiKey: process.env.INTERCOM_ANDROID_API_KEY,
				appId: process.env.INTERCOM_APP_ID,
				// Need to disable this otherwise permissions are
				// requested on app launch
				// isPushNotificationsEnabledIOS: true,
				isPushNotificationsEnabledAndroid: true,
			},
		],
		[
			'customerio-expo-plugin',
			// https://customer.io/docs/sdk/expo/getting-started/
			{
				android: {
					googleServicesFile,
				},
				ios: {
					handleNotificationClick: false, // https://github.com/customerio/customerio-expo-plugin/issues/83#issuecomment-1682790483
					pushNotification: {
						useRichPush: true,
						env: {
							siteId: process.env.CUSTOMER_IO_SITE_ID,
							apiKey: process.env.CUSTOMER_IO_API_KEY,
							region: 'eu',
						},
					},
				},
			},
		],
	],
	hooks: {
		postPublish: [
			{
				file: 'sentry-expo/upload-sourcemaps',
				config: {
					organization: 'diversified',
					project: 'lemony-mobile',
					authToken: process.env.SENTRY_AUTH_TOKEN,
				},
			},
		],
	},
};

export default expoConfig;
