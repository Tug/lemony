import { Button, Image, Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { useUser } from '../../../hooks/use-user';
import { Step } from './step';
import OnboardingScreen from '../components/screen';
import KycStatus from '../../kyc-status';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

// export const previousScreen = 'onboardingKYC';
export const nextScreen = Platform.select({
	web: 'home',
	default: 'howItWorks',
});

export default function OnboardingDone() {
	const { t } = useTranslation();
	const navigateTo = useNavigateToScreen(true);
	const { user, isVerifiedProfile } = useUser({
		requireAuth: true,
		redirectIfProfileIncomplete: true,
	});

	return (
		<OnboardingScreen
			title={t('Congratulations!')}
			subtitle={
				<>
					<View tw="my-1">
						<Text tw="text-sm dark:text-white">
							{t('Hi {{profile.firstName}}, nice to meet you.', {
								profile: user?.data.profile,
							})}
						</Text>
					</View>
					<View tw="my-1">
						<Text tw="text-sm dark:text-white">
							{t('We’ve created a personal account for you.')}
						</Text>
					</View>
				</>
			}
			canGoBack={false}
			isForm={false}
			isModal={Platform.OS === 'web'}
		>
			<View tw="px-5">
				<View tw="rounded-3xl bg-gray-100 dark:bg-gray-800 p-8">
					<View tw="mb-5">
						<Text tw="text-xl font-bold dark:text-white">
							{t('Sign up process')}
						</Text>
					</View>
					<View tw="flex-col">
						<View tw="flex-row">
							<View tw="mr-3 flex-col">
								<Step />
							</View>
							<View tw="flex-col">
								<View tw="my-1">
									<Text tw="text-sm font-semibold dark:text-white">
										{t('Step {{count}}', { count: 1 })}
									</Text>
								</View>
								<Text tw="dark:text-white">
									{t('Verify your phone number')}
								</Text>
							</View>
						</View>
						<View tw="flex-row">
							<View tw="mr-3 flex-col">
								<Step />
							</View>
							<View tw="flex-col">
								<View tw="my-1">
									<Text tw="text-sm font-semibold dark:text-white">
										{t('Step {{count}}', { count: 2 })}
									</Text>
								</View>
								<Text tw="dark:text-white">
									{t('Fill in your information')}
								</Text>
							</View>
						</View>
						<View tw="flex-row">
							<View tw="mr-3 flex-col">
								<Step />
							</View>
							<View tw="flex-col">
								<View tw="my-1">
									<Text tw="text-sm font-semibold dark:text-white">
										{t('Step {{count}}', { count: 3 })}
									</Text>
								</View>
								<Text tw="dark:text-white">
									{t('Accept disclaimer and terms')}
								</Text>
							</View>
						</View>
						<View tw="flex-row">
							<View tw="mr-3 flex-col">
								<Step completed={isVerifiedProfile} isLast />
							</View>
							<View tw="shrink flex-col">
								<View tw="my-1">
									<Text tw="text-sm font-semibold dark:text-white">
										{t('Step {{count}}', { count: 4 })}
									</Text>
								</View>
								<Text tw="dark:text-white">
									{t('Verify your ID')}
								</Text>
							</View>
							<View tw="grow self-center">
								<KycStatus small />
							</View>
						</View>
					</View>
				</View>
				<View tw="my-6">
					<Button
						size="regular"
						variant="primary"
						onPress={() =>
							navigateTo(nextScreen, undefined, {
								is_onboarding: '1',
							})
						}
					>
						{t('Continue')}
					</Button>
				</View>
			</View>
		</OnboardingScreen>
	);
}
