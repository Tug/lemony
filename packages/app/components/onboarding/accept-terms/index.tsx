import EditProfileContent from '../../edit-profile/content';
import {
	useNavigateToOnboarding,
	useNavigateToScreen,
} from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import React, { useCallback, useEffect } from 'react';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { Alert } from '@diversifiedfinance/design-system/alert';
import OnboardingScreen from '../components/screen';
import { useAuth } from '@diversifiedfinance/app/hooks/auth/use-auth';
import { useTranslation } from 'react-i18next';
import { useFeature } from '@growthbook/growthbook-react';
import { Platform } from 'react-native';

export const previousScreen = 'onboardingInfo';
// export const nextScreen = 'onboardingKYC';

export default function OnboardingAcceptTerms() {
	const { mutate: refreshUser, user } = useUser({ requireAuth: true });
	const { t } = useTranslation();
	const navigateToScreen = useNavigateToOnboarding();
	const kycAtOnboardingDisabled = useFeature('kyc-at-onboarding').off;

	const onCompleted = useCallback(async () => {
		await refreshUser();
		navigateToScreen(
			!kycAtOnboardingDisabled ? 'onboardingKYC' : 'onboardingDone'
		);
	}, [kycAtOnboardingDisabled, navigateToScreen, refreshUser]);

	useEffect(() => {
		if (
			user?.data.profile.termsAndConditionsAccepted &&
			user?.data.profile.disclaimerAccepted
		) {
			onCompleted();
		}
	}, []);

	return (
		<OnboardingScreen
			title={t('Sign Up')}
			subtitle={t(
				'Sign up to access the most exciting investment opportunities.'
			)}
			stepCount={4}
			stepNumber={3}
			stepName={t('Information')}
			previousScreen={previousScreen}
			isModal={Platform.OS === 'web'}
		>
			<EditProfileContent
				cta={t('Continue')}
				fields={['disclaimerAccepted', 'termsAndConditionsAccepted']}
				hideIfTruthy={['email']}
				onCompleted={onCompleted}
			/>
		</OnboardingScreen>
	);
}
