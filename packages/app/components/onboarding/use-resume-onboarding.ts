import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { useCallback } from 'react';
import {
	useNavigateToHome,
	useNavigateToOnboarding,
	useNavigateToScreen,
} from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { useFeature } from '@growthbook/growthbook-react';

export function useResumeOnboarding() {
	const {
		isIncompletedProfile,
		isTermsNotAccepted,
		isAuthenticated,
		isVerifiedProfile,
	} = useUser();
	const navigateTo = useNavigateToOnboarding();
	const navigateToHome = useNavigateToHome(true);
	const kycAtOnboardingDisabled = useFeature('kyc-at-onboarding').off;

	const resumeOnboarding = useCallback(() => {
		if (isAuthenticated) {
			if (
				isIncompletedProfile ||
				isTermsNotAccepted ||
				(!isVerifiedProfile && !kycAtOnboardingDisabled)
			) {
				if (isIncompletedProfile) {
					navigateTo('onboardingInfo');
				} else if (isTermsNotAccepted) {
					navigateTo('onboardingAcceptTerms');
				} else if (!isVerifiedProfile) {
					navigateTo('onboardingKYC');
				}
				return;
			}
			navigateToHome();
		}
	}, [
		navigateTo,
		navigateToHome,
		isAuthenticated,
		isIncompletedProfile,
		isTermsNotAccepted,
		isVerifiedProfile,
	]);

	return resumeOnboarding;
}
