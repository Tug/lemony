import {
	BottomTabNavigatorParams,
	HomeStackParams,
	PortfolioStackParams,
	OnboardingNavigatorParams,
	RootStackNavigatorParams,
	SettingsStackParams,
} from './navigators/types';

export const homeTabScreens: {
	[screen in keyof HomeStackParams]?: string;
} = {
	home: '',
};

export const portfolioTabScreens: {
	[screen in keyof PortfolioStackParams]?: string;
} = {
	portfolio: 'portfolio',
};

export const bottomTabsScreens: {
	[screen in keyof BottomTabNavigatorParams]?: string;
} = {
	homeTab: '',
	portfolioTab: 'portfolio',
	settingsTab: 'settings',
	marketTab: 'market',
	notificationsTab: 'notifications',
};

export const onboardingScreens: {
	[screen in keyof OnboardingNavigatorParams]?: string;
} = {
	onboardingHome: 'onboarding',
	onboardingSignIn: 'onboarding/sign-in',
	onboardingSignUp: 'onboarding/sign-up',
	onboardingInfo: 'onboarding/info',
	onboardingKYC: 'onboarding/kyc',
	onboardingDone: 'onboarding/done',
	onboardingAcceptTerms: 'onboarding/accept-terms',
};

export const settingsScreens: {
	[screen in keyof SettingsStackParams]?: string;
} = {
	settingsMenu: 'settings',
	profileSettings: 'settings/profile',
	preferencesSettings: 'settings/preferences',
	kycSettings: 'settings/kyc',
	accountSettings: 'settings/account',
	socialSettings: 'settings/account/social',
	deleteSettings: 'settings/account/delete',
	bankingSettings: 'settings/banking',
	bankAccountSettings: 'settings/banking/account/:bankAccountId',
	notificationSettings: 'settings/notifications',
	verifyEmail: 'settings/account/verify-email',
	verifyPhoneNumber: 'settings/account/verify-phone-number',
	addBankAccount: 'settings/add-bank-account',
	aboutSettings: 'settings/about',
};

export const rootStackScreens: {
	[screen in keyof RootStackNavigatorParams]?: string;
} = {
	project: 'project/:slug',
	login: 'login',
	signup: 'signup',
	search: 'search',
	creditWallet: 'credit-wallet',
	addCard: 'add-card',
	checkout: 'checkout/:slug',
	tokenClaim: 'token-claim/:slug',
	referAFriend: 'refer-a-friend',
	vipProgram: 'vip',
	howItWorks: 'how-it-works',
	notifications: 'notifications',
	editProfile: 'settings/profile/edit',
	editAddress: 'settings/profile/address/edit',
	...settingsScreens,
};

export const allRoutes = {
	...homeTabScreens,
	...portfolioTabScreens,
	...bottomTabsScreens,
	...onboardingScreens,
	...rootStackScreens,
};

export const config = {
	screens: {
		bottomTabs: {
			initialRouteName: 'homeTab',
			screens: {
				homeTab: {
					screens: homeTabScreens,
				},
				portfolioTab: {
					screens: portfolioTabScreens,
				},
			},
		},
		onboarding: {
			initialRouteName: 'onboardingHome',
			screens: onboardingScreens,
		},
		// settings: {
		// 	initialRouteName: 'settingsMenu',
		// 	screens: settingsScreens,
		// },
		...rootStackScreens,
	},
};

export default config;
