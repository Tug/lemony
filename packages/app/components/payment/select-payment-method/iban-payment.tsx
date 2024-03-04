import { useWallets } from '@diversifiedfinance/app/hooks/api-hooks';
import { Text, View } from '@diversifiedfinance/design-system';
import { IbanInformation } from '../iban-information';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

export function IBANPayment({ title }: { title?: string }) {
	const { t } = useTranslation();
	const { data: wallets } = useWallets();
	const eurWallet = wallets?.fiat?.find(({ currency }) => currency === 'EUR');

	if (!eurWallet) {
		return <Text tw="text-black dark:text-white">{t('KYC needed')}</Text>;
	}

	return (
		<View>
			<View tw="my-4">
				<Text tw="text-base text-black dark:text-white">
					{title ?? t('Credit your account via wire transfer.')}
				</Text>
			</View>
			<IbanInformation />
			<View tw="mt-4">
				<View tw="my-1">
					<Text tw="text-xs text-black dark:text-white">
						<Trans t={t}>
							This IBAN account was created for you by Diversified
							and managed by our payment service provider
							Mangopay. You can enter any reference you like for
							the transfer.
						</Trans>
					</Text>
				</View>
			</View>
		</View>
	);
}
