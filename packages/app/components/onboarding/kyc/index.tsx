import { Button, Image, Text, View } from '@diversifiedfinance/design-system';
import React, { useCallback, useEffect, useState } from 'react';
import { TextLink } from '../../../navigation/link';
import {
	useNavigateToOnboarding,
	useNavigateToScreen,
} from '../../../navigation/lib/use-navigate-to';
import Sumsub, { Result as KYCResult } from '../../../lib/sumsub';
import { useUser } from '../../../hooks/use-user';
import OnboardingScreen from '../components/screen';
import { useKycSync } from '@diversifiedfinance/app/hooks/use-kyc-sync';
import { Trans, useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

export const previousScreen = 'onboardingInfo';
export const nextScreen = 'onboardingDone';

export default function OnboardingKYC() {
	useUser({
		requireAuth: true,
		redirectIfProfileIncomplete: true,
	});
	const { t } = useTranslation();
	const syncKYC = useKycSync(false);
	const [isVerifying, setVerifying] = useState<boolean>(false);
	const navigateToScreen = useNavigateToOnboarding();
	// const onSuccess = useCallback(() => {
	// 	navigateToScreen(nextScreen);
	// }, [navigateToScreen]);
	const onClose = useCallback(async () => {
		syncKYC();
		setVerifying(false);
		navigateToScreen(nextScreen);
	}, [syncKYC, navigateToScreen]);

	return (
		<OnboardingScreen
			title={t('Sign Up')}
			stepCount={4}
			stepNumber={4}
			stepName={t('KYC & AML')}
			isForm={false}
			previousScreen={previousScreen}
			isModal={Platform.OS === 'web'}
		>
			<Sumsub
				opened={isVerifying}
				// onSuccess={onSuccess}
				onClose={onClose}
			/>
			<View tw="mx-5 h-full flex-col items-stretch">
				<View tw="my-4">
					<Text tw="text-2xl font-bold dark:text-white">
						{t('We need to verify your ID')}
					</Text>
				</View>
				<View tw="my-4">
					<Text tw="text-base dark:text-white">
						<Trans t={t}>
							In order to validate your account, we have to be
							100% sure that you are you. As a financial service,
							we need to comply with{' '}
							<TextLink
								href={t(
									'https://sumsub.com/how-to-pass-verification/'
								)}
								tw="font-bold underline underline-offset-4"
							>
								KYC and AML requirements
							</TextLink>
							.
						</Trans>
					</Text>
				</View>
				<View tw="mb-4 mt-2">
					<Text tw="text-base dark:text-white">
						<Trans t={t}>
							You just need to go thought some steps which will
							help us maintain a secure environment for your
							investments.
						</Trans>
					</Text>
				</View>
				{Platform.OS !== 'web' && (
					<View tw="my-2">
						<Button
							size="regular"
							onPress={() => setVerifying(true)}
						>
							{t('Verify Now')}
						</Button>
					</View>
				)}
				<View tw="my-2">
					<Button size="regular" variant="outlined" onPress={onClose}>
						{t('I don’t have my ID with me')}
					</Button>
				</View>
			</View>
		</OnboardingScreen>
	);
}
