import { View } from '@diversifiedfinance/design-system';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { breakpoints } from '@diversifiedfinance/design-system/theme';
import { SettingsMd } from './index.md';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useBankAccounts } from '@diversifiedfinance/app/hooks/api-hooks';
import { friendlyFormatIBAN } from '@diversifiedfinance/app/lib/yup/validators/iban/ibantools';
import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import { useWindowDimensions } from 'react-native';
import { BankAccountSettings } from '@diversifiedfinance/app/components/settings/banking/bank-account';
import { NoBankAccounts } from './empty';

export function BankingSettings() {
	const { t } = useTranslation();
	const { width } = useWindowDimensions();
	const isLgWidth = width >= breakpoints.lg;
	const { data, isLoading } = useBankAccounts();
	const bankAccountsRoutes =
		data?.map((bankAccount, index) => {
			return {
				key: bankAccount.id,
				title: bankAccount.label ?? t('Bank account'),
				value: friendlyFormatIBAN(bankAccount.ibanData.IBAN),
				href: getPath('bankAccountSettings', {
					bankAccountId: bankAccount.id,
				}),
				bankAccountId: bankAccount.id,
			};
		}) ?? [];
	const router = useRouter();
	// router.pathname will have the dynamic route value on web (eg. `/settings/[[...slug]]`)
	// router.asPath will have the actual route value (eg. `/settings/profile`)
	const pathname = router.asPath;
	const routeIndex =
		bankAccountsRoutes
			.map((r, index) => ({
				...r,
				index,
				pathname:
					r.href?.pathname ??
					(typeof r.href === 'string'
						? new URL(r.href, 'http://e.c').pathname
						: undefined),
			}))
			.filter((r) => Boolean(r.pathname))
			.sort((a, b) => b.pathname.localeCompare(a.pathname))
			.find((r) => pathname.startsWith(r.pathname))?.index ?? 0;
	const bankAccount = bankAccountsRoutes[routeIndex];

	return isLgWidth ? (
		<SettingsMd
			currentRouteIndex={routeIndex}
			routes={bankAccountsRoutes}
		/>
	) : (
		<View>
			{bankAccount ? (
				<BankAccountSettings
					bankAccountId={bankAccount.bankAccountId}
				/>
			) : (
				<NoBankAccounts isLoading={isLoading} />
			)}
		</View>
	);
}

export default BankingSettings;
