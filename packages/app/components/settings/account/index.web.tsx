import { useUser } from '../../../hooks/use-user';
import { Spinner, View } from '@diversifiedfinance/design-system';
import { useAccountSettingsRoutes } from './routes';
import { MenuList } from '@diversifiedfinance/components';
import React from 'react';
import SettingsHeader from '@diversifiedfinance/app/components/settings/header';
import { useTranslation } from 'react-i18next';
import { breakpoints } from '@diversifiedfinance/design-system/theme';
import { SettingsMd } from './index.md';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useWindowDimensions } from 'react-native';
import { SettingTabsScene } from '@diversifiedfinance/app/components/settings/account/tabs';

export function AccountSettings() {
	const { t } = useTranslation();
	const { width } = useWindowDimensions();
	const isLgWidth = width >= breakpoints.lg;
	const { isAuthenticated } = useUser({
		redirectTo: '/login',
		redirectIfProfileIncomplete: false,
	});
	const accountSettingsRoutes = useAccountSettingsRoutes();
	const router = useRouter();
	// router.pathname will have the dynamic route value on web (eg. `/settings/[[...slug]]`)
	// router.asPath will have the actual route value (eg. `/settings/profile`)
	const pathname = router.asPath;
	const routeIndex =
		accountSettingsRoutes
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

	if (!isAuthenticated) {
		return (
			<View tw="flex-1 items-center justify-center">
				<Spinner />
			</View>
		);
	}

	return isLgWidth ? (
		<SettingsMd
			currentRouteIndex={routeIndex}
			routes={accountSettingsRoutes}
		/>
	) : (
		<View>
			<SettingsHeader title={t('Account')} />
			<SettingTabsScene route={accountSettingsRoutes[routeIndex]} />
		</View>
	);
}

export default AccountSettings;
