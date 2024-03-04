import { View } from '@diversifiedfinance/design-system/view';
import React, { useCallback } from 'react';
import {
	Button,
	Image,
	PressableScale,
	Text,
} from '@diversifiedfinance/design-system';
import {
	useCreditsWallet,
	useEurWallet,
} from '@diversifiedfinance/app/hooks/api-hooks';
import * as Clipboard from 'expo-clipboard';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import Copy from '@diversifiedfinance/design-system/icon/Copy';
import { toast } from '@diversifiedfinance/design-system/toast';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { Separator } from './separator';
import { IbanInformationSkeleton } from './skeleton';
import {
	printMangopayMoney,
	printMoney,
} from '@diversifiedfinance/app/lib/mangopay';
import { useTranslation } from 'react-i18next';

export interface UserWalletCardProps {
	title?: string;
	tw?: string;
}

const formatIBAN = (rawIBAN: string) =>
	rawIBAN
		.replace(/[^\dA-Z]/g, '')
		.replace(/(.{4})/g, '$1 ')
		.trim();

export interface IbanInformationProps {
	showBalance?: boolean;
	showName?: boolean;
	showCredits?: boolean;
}

export function IbanInformation({
	showBalance = false,
	showName = false,
	showCredits = false,
}: IbanInformationProps) {
	const { t } = useTranslation();
	const { data: eurWallet, isLoading } = useEurWallet();
	const { data: creditsWallet } = useCreditsWallet();
	const isDark = useIsDarkMode();

	const copyIBANToClipboard = useCallback(async () => {
		if (eurWallet && eurWallet?.iban?.IBAN) {
			await Clipboard.setStringAsync(eurWallet?.iban?.IBAN);
			toast.success(t('IBAN copied to clipboard!'));
		}
	}, [t, eurWallet]);

	const copyBICToClipboard = useCallback(async () => {
		if (eurWallet && eurWallet?.iban?.BIC) {
			await Clipboard.setStringAsync(eurWallet?.iban?.BIC);
			toast.success(t('BIC copied to clipboard!'));
		}
	}, [t, eurWallet]);

	if (isLoading || !eurWallet) {
		return (
			<IbanInformationSkeleton
				showBalance={showBalance}
				showName={showName}
			/>
		);
	}

	return (
		<View>
			{showBalance && (
				<>
					<View tw="my-3 flex-row justify-between">
						<View>
							<Text tw="text-gray-700 dark:text-gray-300">
								{t('Balance')}
							</Text>
						</View>
						<View>
							<Text tw="font-bold text-black dark:text-white">
								{printMangopayMoney(eurWallet.balance)}
							</Text>
						</View>
					</View>
					<Separator />
				</>
			)}
			{showCredits && (
				<>
					<View tw="my-3 flex-row justify-between">
						<View>
							<Text tw="text-gray-700 dark:text-gray-300">
								{t('Free Credits')}
							</Text>
						</View>
						<View>
							<Text tw="font-bold text-black dark:text-white">
								{printMoney(creditsWallet?.balance ?? 0)}
							</Text>
						</View>
					</View>
					<Separator />
				</>
			)}
			{showName && (
				<>
					<View tw="my-3 flex-row justify-between">
						<View>
							<Text tw="text-gray-700 dark:text-gray-300">
								{t('Name')}
							</Text>
						</View>
						<View>
							<Text tw="font-bold text-black dark:text-white">
								{eurWallet.iban?.OwnerName ?? 'N/A'}
							</Text>
						</View>
					</View>
					<Separator />
				</>
			)}
			<View tw="my-3 flex-row justify-between">
				<View>
					<Text tw="text-gray-700 dark:text-gray-300">
						{t('IBAN')}
					</Text>
				</View>
				<View tw="ml-4 shrink grow flex-row justify-end">
					<PressableScale onPress={copyIBANToClipboard}>
						<View tw="flex-row items-center">
							<Text tw="text-right text-xs font-bold text-black dark:text-white">
								{eurWallet.iban?.IBAN
									? formatIBAN(eurWallet.iban?.IBAN)
									: 'N/A'}{' '}
							</Text>
							<Copy
								width={16}
								height={16}
								color={isDark ? colors.white : colors.gray[900]}
							/>
						</View>
					</PressableScale>
				</View>
			</View>
			<Separator />
			<View tw="my-3 flex-row justify-between">
				<View>
					<Text tw="text-gray-700 dark:text-gray-300">
						{t('BIC')}
					</Text>
				</View>
				<View tw="flex-row">
					<PressableScale onPress={copyBICToClipboard}>
						<View tw="flex-row items-center">
							<Text tw="text-xs font-bold text-black dark:text-white">
								{eurWallet.iban?.BIC ?? 'N/A'}{' '}
							</Text>
							<Copy
								width={16}
								height={16}
								color={isDark ? colors.white : colors.gray[900]}
							/>
						</View>
					</PressableScale>
				</View>
			</View>
		</View>
	);
}
