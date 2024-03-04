// Base polyfill: use relative path to make sure polyfills are loaded first
// TODO: update prettier config to add exceptions to import order
// https://github.com/simonhaenisch/prettier-plugin-organize-imports

// `raf/polyfill` is a requirement for react-native-reanimated to work on web:
// https://docs.swmansion.com/react-native-reanimated/docs/2.x/fundamentals/web-support/#solito--nextjs-compatibility
import '../../../../node_modules/raf/polyfill';
import '../../../../node_modules/react-datepicker/dist/react-datepicker.css';
import '../../../../node_modules/setimmediate';
import '../styles/styles.css';
import { Header } from '@diversifiedfinance/app/components/header';
import { growthbook } from '@diversifiedfinance/app/lib/growthbook';
import { Sentry } from '@diversifiedfinance/app/lib/sentry';
import { AppProviders } from '@diversifiedfinance/app/providers/app-providers';
import { LoginScreen } from '@diversifiedfinance/app/screens/login';
import { VerifyEmailScreen } from '@diversifiedfinance/app/screens/settings/modals/verify-email';
import { EditProfileScreen } from '@diversifiedfinance/app/screens/settings/modals/edit-profile';
import { VerifyPhoneNumberScreen } from '@diversifiedfinance/app/screens/settings/modals/verify-phone-number';
import { AddBankAccountScreen } from '@diversifiedfinance/app/screens/settings/modals/add-bank-account';
import { EditAddressScreen } from '@diversifiedfinance/app/screens/settings/modals/edit-address';
import { AddCardScreen } from '@diversifiedfinance/app/screens/add-card';
import { CheckoutScreen } from '@diversifiedfinance/app/screens/checkout';
import { CreditWalletScreen } from '@diversifiedfinance/app/screens/credit-wallet';
import { ReferAFriendScreen } from '@diversifiedfinance/app/screens/refer-a-friend';
import { withColorScheme } from '@diversifiedfinance/components/memo-with-theme';
import { usePlatformBottomHeight } from '@diversifiedfinance/app/hooks/use-platform-bottom-height';
import { View } from '@diversifiedfinance/design-system/view';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import * as intercom from '@diversifiedfinance/app/lib/intercom';
import i18n, { init as i18nInit } from '@diversifiedfinance/app/lib/i18n';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { Toaster } from '@diversifiedfinance/design-system/toast';
import { init as analyticsInit } from '@diversifiedfinance/app/lib/analytics';
import {
	OnboardingAcceptTermsScreen,
	OnboardingDoneScreen,
	OnboardingHomeScreen,
	OnboardingInfoScreen,
	OnboardingKYCScreen,
	OnboardingSignInScreen,
	OnboardingSignUpScreen,
} from '@diversifiedfinance/app/screens/onboarding';
import { OpenInAppModal } from '@diversifiedfinance/app/components/open-in-app-modal';
import { isMobile } from 'react-device-detect';

i18nInit();
analyticsInit();

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	environment: process.env.STAGE,
});

export default function DiversifiedApp({ Component, pageProps }) {
	const router = useRouter();
	const { ready: i18nextReady } = useTranslation();

	useEffect(() => {
		// Load features asynchronously when the app renders
		// TODO: use getServerSideProps and cache the response for a few seconds
		growthbook.loadFeatures();
	}, []);

	useEffect(() => {
		if (!isMobile) {
			intercom.loadScript();
		}

		const handleRouteChange = () => {
			(window as any).Intercom?.('update');
		};
		router.events.on('routeChangeComplete', handleRouteChange);
		return () => {
			router.events.off('routeChangeComplete', handleRouteChange);
		};
	}, []);

	// TODO NEXT URGENT: rely on suspense or another mechanism to not disable SSR
	if (!i18nextReady) {
		return null;
	}

	if (Component.getLayout) {
		return Component.getLayout(<Component {...pageProps} />);
	}

	const fullUrl =
		typeof window !== 'undefined'
			? window.location.href
			: `${process.env.NEXT_PUBLIC_BACKEND_URL}${router.asPath}`;

	const meta = pageProps.meta;
	const metaTags = meta ? (
		<>
			<title>{meta.title}</title>
			<meta key="title" name="title" content={meta.title} />

			<meta name="description" content={meta.description} />

			{/* Open graph */}
			<meta property="og:type" content="website" />
			<meta property="og:title" content={meta.title} />
			<meta property="og:description" content={meta.description} />
			<meta property="og:image" content={meta.image} />
			{/* Twitter */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:site" content="@DiversifiedApp" />
			<meta name="twitter:title" content={meta.title} />
			<meta name="twitter:description" content={meta.description} />
			<meta name="twitter:image" content={meta.image} />
			<meta name="twitter:app:name:iphone" content="Diversified" />
			<meta name="twitter:app:id:iphone" content="6446693590" />
			<meta
				name="apple-itunes-app"
				content={`app-id=6446693590, app-argument=${
					pageProps.url ? encodeURIComponent(fullUrl) : ''
				}`}
			/>
		</>
	) : (
		<>
			<title>Diversified Marketplace</title>
			<meta key="title" name="title" content="Diversified" />
		</>
	);
	return (
		<>
			<Head>
				{metaTags}
				<link rel="manifest" href="/manifest.json" />
				<link
					rel="icon"
					sizes="16x16"
					type="image/png"
					href="/icons/favicon-16x16.png"
				/>
				<link
					rel="icon"
					sizes="32x32"
					type="image/png"
					href="/icons/favicon-32x32.png"
				/>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/icons/apple-touch-icon.png"
				/>

				<meta name="application-name" content="Diversified" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="black-translucent"
				/>
				<meta name="apple-mobile-web-app-title" content="Diversified" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="theme-color" content="#000000" />
				<meta
					content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover"
					name="viewport"
				/>
			</Head>
			<I18nextProvider i18n={i18n} defaultNS="app">
				<AppProviders>
					<Container>
						<Header />
						<View tw="w-full items-center md:ml-auto md:w-[calc(100%-248px)]">
							<Component {...pageProps} />
						</View>
						{/*<OpenInAppModal />*/}
					</Container>
					{/* Modals */}

					{/* Settings that renders on top of other modals */}
					{/* TODO NEXT: sync with root stack navigator screens */}
					<EditProfileScreen />
					<EditAddressScreen />
					<VerifyEmailScreen />
					<VerifyPhoneNumberScreen />
					<AddCardScreen />
					<CheckoutScreen />
					<CreditWalletScreen />
					<AddBankAccountScreen />
					<ReferAFriendScreen />
					<OnboardingHomeScreen />
					<OnboardingSignUpScreen />
					<OnboardingSignInScreen />
					<OnboardingInfoScreen />
					<OnboardingAcceptTermsScreen />
					<OnboardingKYCScreen />
					<OnboardingDoneScreen />

					{/* Login should be the last so it renders on top of others if needed */}
					<LoginScreen />
					<Toaster />
				</AppProviders>
			</I18nextProvider>
		</>
	);
}

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
	display: 'swap',
});

const brickText = localFont({
	src: '../../public/fonts/BrickText-Black.woff2',
	weight: '700',
	variable: '--font-brick-text',
});

const Container = withColorScheme(
	({ children }: { children: React.ReactNode }) => {
		const fonts = [inter.variable, brickText.variable].join(' ');
		// const headerHeight = useHeaderHeight();
		const bottomBarHeight = usePlatformBottomHeight();

		return (
			<View
				tw="bg-white dark:bg-black"
				// @ts-ignore
				style={{
					// paddingTop: headerHeight,
					paddingBottom: `calc(${bottomBarHeight}px + env(safe-area-inset-bottom))`,
				}}
			>
				<div className={fonts}>{children}</div>
			</View>
		);
	}
);
