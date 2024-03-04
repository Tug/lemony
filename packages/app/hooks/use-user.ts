import { useContext, useEffect } from 'react';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { UserContext } from '@diversifiedfinance/app/context/user-context';
import {
	useNavigateToOnboarding,
	useNavigateToScreen,
} from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { useFeature } from '@growthbook/growthbook-react';

type UserParams = {
	requireAuth: boolean;
	redirectIfProfileIncomplete?: boolean;
	redirectIfProfileUnverified?: boolean;
};

export function useUser(params?: UserParams) {
	const context = useContext(UserContext);
	const router = useRouter();
	const navigateTo = useNavigateToOnboarding(true);
	const kycAtOnboardingDisabled = useFeature('kyc-at-onboarding').off;

	useEffect(() => {
		if (
			!router ||
			router.asPath.startsWith('/onboarding') ||
			Object.keys(router.query).filter(
				(paramName) =>
					paramName.startsWith('onboarding') &&
					paramName.endsWith('Modal')
			).length > 0
		) {
			return;
		}
		if (!context?.isAuthenticated && params?.requireAuth) {
			navigateTo('onboardingHome');
			return;
		}
		if (
			context?.isAuthenticated &&
			params?.redirectIfProfileIncomplete &&
			context?.isIncompletedProfile
		) {
			navigateTo('onboardingInfo');
			return;
		}
		if (
			context?.isAuthenticated &&
			params?.redirectIfProfileIncomplete &&
			context?.isTermsNotAccepted
		) {
			navigateTo('onboardingAcceptTerms');
			return;
		}
		if (
			kycAtOnboardingDisabled &&
			context?.isAuthenticated &&
			params?.redirectIfProfileUnverified &&
			!context?.isVerifiedProfile
		) {
			navigateTo('onboardingKYC');
		}
	}, [
		context?.isAuthenticated,
		context?.isIncompletedProfile,
		context?.isTermsNotAccepted,
		context?.isVerifiedProfile,
		params?.redirectIfProfileIncomplete,
		params?.requireAuth,
		params?.redirectIfProfileUnverified,
		kycAtOnboardingDisabled,
		navigateTo,
	]);

	if (!context) {
		throw new Error(
			'You need to add `UserProvider` to your root component'
		);
	}

	return context;
}
