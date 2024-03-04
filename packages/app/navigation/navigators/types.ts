import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NextComponentType, NextPageContext } from 'next';

type HomeStackParams = {
	home: undefined;
};

type PortfolioStackParams = {
	portfolio: undefined;
};

type SettingsStackParams = {
	settings: undefined;
	settingsMenu: undefined;
	profileSettings: undefined;
	accountSettings: undefined;
	socialSettings: undefined;
	deleteSettings: undefined;
	bankingSettings: undefined;
	bankAccountSettings: { bankAccountId: string };
	preferencesSettings: undefined;
	kycSettings: undefined;
	notificationSettings: undefined;
	verifyEmail: undefined;
	verifyPhoneNumber: undefined;
	addBankAccount: undefined;
	editNationality: undefined;
	editProfile: undefined;
	editAddress: undefined;
	aboutSettings: undefined;
};

type NotificationsStackParams = {
	notifications: undefined;
	login: undefined;
	settings: undefined;
};

type MarketStackParams = {
	market: undefined;
};

type NextPageProps = any;
type NextNavigationProps = {
	Component?: NextComponentType<NextPageContext, null, NextPageProps>;
	pageProps?: NextPageProps;
};

type BottomTabNavigatorParams = {
	homeTab: NavigatorScreenParams<HomeStackParams>;
	portfolioTab: NavigatorScreenParams<PortfolioStackParams>;
	marketTab: NavigatorScreenParams<MarketStackParams>;
	notificationsTab: NavigatorScreenParams<NotificationsStackParams>;
	settingsTab: NavigatorScreenParams<SettingsStackParams>;
};

type OnboardingNavigatorParams = {
	onboardingHome: undefined;
	onboardingSignIn: undefined;
	onboardingSignUp: undefined;
	onboardingInfo: undefined;
	onboardingAcceptTerms: undefined;
	onboardingKYC: undefined;
	onboardingDone: undefined;
};

type RootStackNavigatorParams = SettingsStackParams & {
	bottomTabs: BottomTabNavigatorParams;
	onboarding: OnboardingNavigatorParams;
	project: { slug: string };
	login: undefined;
	signup: undefined;
	checkout: { slug: string };
	tokenClaim: { slug: string };
	search: undefined;
	creditWallet: undefined;
	addCard: undefined;
	referAFriend: undefined;
	howItWorks: undefined;
};

export type {
	NextNavigationProps,
	HomeStackParams,
	PortfolioStackParams,
	OnboardingNavigatorParams,
	NotificationsStackParams,
	MarketStackParams,
	BottomTabNavigatorParams,
	RootStackNavigatorParams,
	SettingsStackParams,
};
