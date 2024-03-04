import EditProfileContent from '../../edit-profile/content';
import { useNavigateToOnboarding } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import React, { useCallback } from 'react';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { Alert } from '@diversifiedfinance/design-system/alert';
import OnboardingScreen from '../components/screen';
import { useAuth } from '@diversifiedfinance/app/hooks/auth/use-auth';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

export const previousScreen = 'onboardingHome';
export const nextScreen = 'onboardingAcceptTerms';

export default function OnboardingInfo() {
	const { mutate: refreshUser } = useUser({ requireAuth: true });
	const { t } = useTranslation();
	const { logout } = useAuth();
	const navigateToScreen = useNavigateToOnboarding();

	const onCompleted = useCallback(async () => {
		navigateToScreen(nextScreen);
	}, [navigateToScreen]);

	const canGoBack = useCallback(
		() =>
			new Promise<boolean>((resolve) => {
				// Prompt the user before leaving the screen
				Alert.alert(
					t('Log out?'),
					t('Are you sure you want to abort account creation?'),
					[
						{
							text: t("Don't leave"),
							style: 'cancel',
							onPress: () => {
								resolve(false);
							},
						},
						{
							text: t('Abort'),
							style: 'destructive',
							onPress: () => {
								logout();
								resolve(true);
							},
						},
					]
				);
			}),
		[logout]
	);

	return (
		<OnboardingScreen
			title={t('Sign Up')}
			subtitle={t(
				'Sign up to access the most exciting investment opportunities.'
			)}
			stepCount={4}
			stepNumber={2}
			stepName={t('Information')}
			canGoBack={canGoBack}
			previousScreen={previousScreen}
			isModal={Platform.OS === 'web'}
		>
			<EditProfileContent
				cta={t('Continue')}
				fields={[
					'firstName',
					'lastName',
					'email',
					'countryOfResidence',
					'leadSource',
					'sponsorReferralCode',
				]}
				hideIfTruthy={['email']}
				onCompleted={onCompleted}
			/>
		</OnboardingScreen>
	);
}
