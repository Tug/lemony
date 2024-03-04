import { ErrorBoundary } from '@diversifiedfinance/app/components/error-boundary';
import { MenuList } from '@diversifiedfinance/components';
import { useTranslation } from 'react-i18next';
import { useAccountSettingsRoutes } from '@diversifiedfinance/app/components/settings/account/routes';
import SettingsHeader from '@diversifiedfinance/app/components/settings/header';
import React from 'react';
import { ScrollView } from '@diversifiedfinance/design-system';

export function AccountSettings() {
	const { t } = useTranslation();
	const accountSettingsRoutes = useAccountSettingsRoutes();

	return (
		<ErrorBoundary>
			<ScrollView tw="w-full flex-1 mb-16">
				<SettingsHeader title={t('Account Settings')} />
				<MenuList list={accountSettingsRoutes} />
			</ScrollView>
		</ErrorBoundary>
	);
}

export default AccountSettings;
