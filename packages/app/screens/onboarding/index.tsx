import OnboardingHome from '@diversifiedfinance/app/components/onboarding/home';
import OnboardingSignIn from '@diversifiedfinance/app/components/onboarding/sign-in';
import OnboardingSignUp from '@diversifiedfinance/app/components/onboarding/sign-up';
import OnboardingInfo from '@diversifiedfinance/app/components/onboarding/info';
import OnboardingAcceptTerms from '@diversifiedfinance/app/components/onboarding/accept-terms';
import OnboardingKYC from '@diversifiedfinance/app/components/onboarding/kyc';
import OnboardingDone from '@diversifiedfinance/app/components/onboarding/done';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import { withColorScheme } from '@diversifiedfinance/components/memo-with-theme';
import React, { Suspense } from 'react';
import { View } from '@diversifiedfinance/design-system';
import { ErrorBoundary } from '../../components/error-boundary';

const OnboardingHomeScreen = withColorScheme(() => {
	useTrackPageViewed({ name: 'onboardingHome' });

	return (
		<ErrorBoundary>
			<Suspense fallback={<View />}>
				<OnboardingHome />
			</Suspense>
		</ErrorBoundary>
	);
});

const OnboardingSignInScreen = withColorScheme(() => {
	useTrackPageViewed({ name: 'onboardingSignIn' });

	return (
		<ErrorBoundary>
			<Suspense fallback={<View />}>
				<OnboardingSignIn />
			</Suspense>
		</ErrorBoundary>
	);
});

const OnboardingSignUpScreen = withColorScheme(() => {
	useTrackPageViewed({ name: 'onboardingSignUp' });

	return (
		<ErrorBoundary>
			<Suspense fallback={<View />}>
				<OnboardingSignUp />
			</Suspense>
		</ErrorBoundary>
	);
});

const OnboardingInfoScreen = withColorScheme(() => {
	useTrackPageViewed({ name: 'onboardingInfo' });

	return (
		<ErrorBoundary>
			<Suspense fallback={<View />}>
				<OnboardingInfo />
			</Suspense>
		</ErrorBoundary>
	);
});

const OnboardingAcceptTermsScreen = withColorScheme(() => {
	useTrackPageViewed({ name: 'onboardingAcceptTerms' });

	return (
		<ErrorBoundary>
			<Suspense fallback={<View />}>
				<OnboardingAcceptTerms />
			</Suspense>
		</ErrorBoundary>
	);
});

const OnboardingKYCScreen = withColorScheme(() => {
	useTrackPageViewed({ name: 'onboardingKYC' });

	return (
		<ErrorBoundary>
			<Suspense fallback={<View />}>
				<OnboardingKYC />
			</Suspense>
		</ErrorBoundary>
	);
});

const OnboardingDoneScreen = withColorScheme(() => {
	useTrackPageViewed({ name: 'onboardingDone' });

	return (
		<ErrorBoundary>
			<Suspense fallback={<View />}>
				<OnboardingDone />
			</Suspense>
		</ErrorBoundary>
	);
});

export {
	OnboardingHomeScreen,
	OnboardingSignInScreen,
	OnboardingSignUpScreen,
	OnboardingInfoScreen,
	OnboardingAcceptTermsScreen,
	OnboardingKYCScreen,
	OnboardingDoneScreen,
};
