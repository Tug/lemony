import { LoginContent } from '@diversifiedfinance/app/components/login/login-content';
import OnboardingScreen from '../components/screen';
import { Text, View } from '@diversifiedfinance/design-system';
import { TextLink } from '@diversifiedfinance/app/navigation/link';
import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import React from 'react';
import { useResumeOnboarding } from '../use-resume-onboarding';
import { Trans, useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

export const previousScreen = 'onboardingHome';
export const nextScreen = 'home';

export default function OnboardingSignIn() {
	const { t } = useTranslation();
	const resumeOnboarding = useResumeOnboarding();

	return (
		<OnboardingScreen
			title={t('Sign In')}
			subtitle={t(
				'Sign in to access the most exciting investment opportunities.'
			)}
			previousScreen={previousScreen}
			showCarousel
			canGoBack
			isModal={Platform.OS === 'web'}
		>
			<View tw="flex-col">
				<LoginContent
					fromModal={false}
					isSignup={false}
					onLogin={resumeOnboarding}
				/>
				<View tw="mx-4 my-2">
					<Text tw="text-sm font-semibold dark:text-white">
						<Trans t={t}>
							You don’t have an account?{' '}
							<TextLink
								href={getPath('onboardingSignUp')}
								tw="underline underline-offset-2"
							>
								{t('Sign up')}
							</TextLink>
						</Trans>
					</Text>
				</View>
			</View>
		</OnboardingScreen>
	);
}
