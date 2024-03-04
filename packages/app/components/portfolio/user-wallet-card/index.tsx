import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import { Button, Text } from '@diversifiedfinance/design-system';
import { PortfolioCard } from '../card';
import {
	useCreditsWallet,
	useEurWallet,
} from '@diversifiedfinance/app/hooks/api-hooks';
import { UserWalletCardSkeleton } from './skeleton';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { IbanInformation } from '@diversifiedfinance/app/components/payment/iban-information';
import { useKycSync } from '@diversifiedfinance/app/hooks/use-kyc-sync';
import { useTranslation } from 'react-i18next';

export interface UserWalletCardProps {
	visible?: boolean;
	title?: string;
	tw?: string;
}

export function UserWalletCard({
	visible = true,
	title = 'Wallet',
	tw,
}: UserWalletCardProps) {
	const { t } = useTranslation();
	useKycSync();
	const { data: eurWallet, isLoading } = useEurWallet();
	const { data: creditsWallet } = useCreditsWallet();
	const navigateTo = useNavigateToScreen();

	if (isLoading || !eurWallet) {
		return <UserWalletCardSkeleton />;
	}

	if (!eurWallet || !visible) {
		return null;
	}

	return (
		<View tw={tw}>
			<View tw="mb-5 mt-2 items-start">
				<Text tw="text-center text-2xl leading-8 dark:text-white">
					{title}
				</Text>
			</View>
			<PortfolioCard tw="px-5">
				<IbanInformation
					showBalance
					showName
					showCredits={Boolean(creditsWallet?.balance)}
				/>
				<View tw="mt-3 mb-2">
					<Button
						size="regular"
						variant="primary"
						onPress={() => navigateTo('creditWallet')}
					>
						{t('Credit my wallet')}
					</Button>
				</View>
			</PortfolioCard>
		</View>
	);
}
