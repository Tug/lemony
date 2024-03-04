import SettingsHeader from '../header';
import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import { MenuList } from '@diversifiedfinance/components';
import { useTranslation } from 'react-i18next';
import { useBankAccounts } from '@diversifiedfinance/app/hooks/api-hooks';
import {
	Button,
	ScrollView,
	Spinner,
	Text,
	View,
} from '@diversifiedfinance/design-system';
import React from 'react';
import { friendlyFormatIBAN } from '@diversifiedfinance/app/lib/yup/validators/iban/ibantools';
import { RefreshControl } from 'react-native';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';

export function BankingSettings() {
	const { t } = useTranslation();
	const { data, isLoading, mutate: refreshBankAccounts } = useBankAccounts();

	const bankAccountsRoutes = data?.map((bankAccount, index) => {
		return {
			title: bankAccount.label ?? t('Bank account'),
			value: friendlyFormatIBAN(bankAccount.ibanData.IBAN),
			href: getPath('bankAccountSettings', {
				bankAccountId: bankAccount.id,
			}),
		};
	});
	const redirectTo = useNavigateToScreen();

	return (
		<>
			<SettingsHeader
				title={t('Your Bank Accounts')}
				headerRight={
					<Button
						variant="primary"
						onPress={() =>
							redirectTo('addBankAccount', undefined, {
								addBankAccountModal: true,
							})
						}
					>
						{t('Add')}
					</Button>
				}
			/>
			{bankAccountsRoutes && bankAccountsRoutes.length > 0 ? (
				<ScrollView
					refreshControl={
						<RefreshControl
							refreshing={isLoading}
							onRefresh={refreshBankAccounts}
						/>
					}
				>
					<MenuList list={bankAccountsRoutes} />
				</ScrollView>
			) : (
				<View tw="m-4 items-center">
					{isLoading ? (
						<Spinner />
					) : (
						<Text tw="text-black dark:text-white">
							{t('No bank accounts registered')}
						</Text>
					)}
				</View>
			)}
		</>
	);
}

export default BankingSettings;
