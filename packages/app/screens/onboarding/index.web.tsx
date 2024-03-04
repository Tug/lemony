import OnboardingHome from '@diversifiedfinance/app/components/onboarding/home';
import OnboardingSignIn from '@diversifiedfinance/app/components/onboarding/sign-in';
import OnboardingSignUp from '@diversifiedfinance/app/components/onboarding/sign-up';
import OnboardingInfo from '@diversifiedfinance/app/components/onboarding/info';
import OnboardingAcceptTerms from '@diversifiedfinance/app/components/onboarding/accept-terms';
import OnboardingKYC from '@diversifiedfinance/app/components/onboarding/kyc';
import OnboardingDone from '@diversifiedfinance/app/components/onboarding/done';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import { withColorScheme } from '@diversifiedfinance/components/memo-with-theme';
import React, { Suspense, useEffect } from 'react';
import { View } from '@diversifiedfinance/design-system';
import { ErrorBoundary } from '../../components/error-boundary';
import {
	useModalScreenContext,
	withModalScreen,
} from '@diversifiedfinance/design-system/modal-screen';
import { useTranslation } from 'react-i18next';

const OnboardingHomeScreen = withModalScreen(
	withColorScheme(() => {
		useTrackPageViewed({ name: 'onboardingHome' });

		return (
			<ErrorBoundary>
				<Suspense fallback={<View />}>
					<OnboardingHome />
				</Suspense>
			</ErrorBoundary>
		);
	}),
	{
		title: 'Sign Up',
		matchingPathname: '/onboarding',
		matchingQueryParam: 'onboardingModal',
		disableBackdropPress: false,
		snapPoints: ['100%'],
		closeButtonProps: {
			tw: 'pointer-events-none hover:opacity-0 opacity-0',
		},
	}
);

const OnboardingSignUpScreen = withModalScreen(
	withColorScheme(() => {
		useTrackPageViewed({ name: 'onboardingSignUp' });
		const { t } = useTranslation();
		const modalScreenContext = useModalScreenContext();

		useEffect(() => {
			modalScreenContext?.setTitle(t('Sign Up'));
		}, [modalScreenContext, t]);

		return (
			<ErrorBoundary>
				<Suspense fallback={<View />}>
					<OnboardingSignUp />
				</Suspense>
			</ErrorBoundary>
		);
	}),
	{
		title: 'Sign Up',
		matchingPathname: '/onboarding/sign-up',
		matchingQueryParam: 'onboardingSignUpModal',
		disableBackdropPress: false,
		snapPoints: ['100%'],
		closeButtonProps: {
			tw: 'pointer-events-none hover:opacity-0 opacity-0',
		},
	}
);

const OnboardingSignInScreen = withModalScreen(
	withColorScheme(() => {
		useTrackPageViewed({ name: 'onboardingSignIn' });
		const { t } = useTranslation();
		const modalScreenContext = useModalScreenContext();

		useEffect(() => {
			modalScreenContext?.setTitle(t('Sign In'));
		}, [modalScreenContext, t]);

		return (
			<ErrorBoundary>
				<Suspense fallback={<View />}>
					<OnboardingSignIn />
				</Suspense>
			</ErrorBoundary>
		);
	}),
	{
		title: 'Sign In',
		matchingPathname: '/onboarding/sign-in',
		matchingQueryParam: 'onboardingSignInModal',
		disableBackdropPress: true,
		snapPoints: ['100%'],
		closeButtonProps: {
			tw: 'pointer-events-none hover:opacity-0 opacity-0',
		},
	}
);

const OnboardingInfoScreen = withModalScreen(
	withColorScheme(() => {
		useTrackPageViewed({ name: 'onboardingInfo' });
		const { t } = useTranslation();
		const modalScreenContext = useModalScreenContext();

		useEffect(() => {
			modalScreenContext?.setTitle(t('Personal Information'));
		}, [modalScreenContext, t]);

		return (
			<ErrorBoundary>
				<Suspense fallback={<View />}>
					<OnboardingInfo />
				</Suspense>
			</ErrorBoundary>
		);
	}),
	{
		title: 'Info',
		matchingPathname: '/onboarding/info',
		matchingQueryParam: 'onboardingInfoModal',
		disableBackdropPress: true,
		snapPoints: ['100%'],
		closeButtonProps: {
			tw: 'pointer-events-none hover:opacity-0 opacity-0',
		},
	}
);

const OnboardingAcceptTermsScreen = withModalScreen(
	withColorScheme(() => {
		useTrackPageViewed({ name: 'onboardingAcceptTerms' });
		const { t } = useTranslation();
		const modalScreenContext = useModalScreenContext();

		useEffect(() => {
			modalScreenContext?.setTitle(t('Accept Terms and Conditions'));
		}, [modalScreenContext, t]);

		return (
			<ErrorBoundary>
				<Suspense fallback={<View />}>
					<OnboardingAcceptTerms />
				</Suspense>
			</ErrorBoundary>
		);
	}),
	{
		title: 'Accept Terms',
		matchingPathname: '/onboarding/accept-terms',
		matchingQueryParam: 'onboardingAcceptTermsModal',
		disableBackdropPress: true,
		snapPoints: ['100%'],
		closeButtonProps: {
			tw: 'pointer-events-none hover:opacity-0 opacity-0',
		},
	}
);

const OnboardingKYCScreen = withModalScreen(
	withColorScheme(() => {
		useTrackPageViewed({ name: 'onboardingKYC' });
		const { t } = useTranslation();
		const modalScreenContext = useModalScreenContext();

		useEffect(() => {
			modalScreenContext?.setTitle(t('KYC'));
		}, [modalScreenContext, t]);

		return (
			<ErrorBoundary>
				<Suspense fallback={<View />}>
					<OnboardingKYC isModal />
				</Suspense>
			</ErrorBoundary>
		);
	}),
	{
		title: 'KYC',
		matchingPathname: '/onboarding/kyc',
		matchingQueryParam: 'onboardingKYCModal',
		disableBackdropPress: true,
		snapPoints: ['100%'],
		closeButtonProps: {
			tw: 'pointer-events-none hover:opacity-0 opacity-0',
		},
	}
);

const OnboardingDoneScreen = withModalScreen(
	withColorScheme(() => {
		useTrackPageViewed({ name: 'onboardingDone' });

		return (
			<ErrorBoundary>
				<Suspense fallback={<View />}>
					<OnboardingDone isModal />
				</Suspense>
			</ErrorBoundary>
		);
	}),
	{
		title: 'Congratulations!',
		matchingPathname: '/onboarding/done',
		matchingQueryParam: 'onboardingDoneModal',
		snapPoints: ['100%'],
	}
);

export {
	OnboardingHomeScreen,
	OnboardingSignInScreen,
	OnboardingSignUpScreen,
	OnboardingInfoScreen,
	OnboardingAcceptTermsScreen,
	OnboardingKYCScreen,
	OnboardingDoneScreen,
};
