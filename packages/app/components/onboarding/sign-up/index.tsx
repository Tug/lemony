import { LoginContent } from '@diversifiedfinance/app/components/login/login-content';
import OnboardingScreen from '../components/screen';
import { Text, View } from '@diversifiedfinance/design-system';
import { TextLink } from '@diversifiedfinance/app/navigation/link';
import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import React, { useEffect } from 'react';
import { useResumeOnboarding } from '../use-resume-onboarding';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

export const previousScreen = 'onboardingHome';
export const nextScreen = 'onboardingInfo';

export default function OnboardingSignUp() {
	const { t } = useTranslation();
	const resumeOnboarding = useResumeOnboarding();

	return (
		<OnboardingScreen
			title={t('Sign Up')}
			subtitle={t(
				'Sign up to access the most exciting investment opportunities.'
			)}
			stepCount={3}
			stepNumber={1}
			stepName={t('Account')}
			previousScreen={previousScreen}
			showCarousel
			canGoBack
			isModal={Platform.OS === 'web'}
		>
			<View tw="flex-col">
				<LoginContent
					fromModal={false}
					isSignup
					onLogin={resumeOnboarding}
				/>
				<View tw="mx-4 my-2">
					<Text tw="text-sm font-semibold dark:text-white">
						{t('You already have an account?')}{' '}
						<TextLink
							href={getPath('onboardingSignIn')}
							tw="underline underline-offset-2"
						>
							{t('Sign in')}
						</TextLink>
					</Text>
				</View>
			</View>
		</OnboardingScreen>
	);
}
