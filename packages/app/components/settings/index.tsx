import ProfileRow from './components/profile-row';
import { ErrorBoundary } from '@diversifiedfinance/app/components/error-boundary';
import { useAuth } from '@diversifiedfinance/app/hooks/auth/use-auth';
import { Link } from '@diversifiedfinance/app/navigation/link';
import { MenuList } from '@diversifiedfinance/components';
import { Button, ScrollView, View } from '@diversifiedfinance/design-system';
import { useTranslation } from 'react-i18next';
import Security from './security';
import React from 'react';
import { useSettingsRoutes } from '@diversifiedfinance/app/components/settings/routes';

const SettingsMenu = () => {
	const { t } = useTranslation();
	const { logout } = useAuth();
	const { profileRoute, mainSettingsRoutes, helpRoutes, aboutRoutes } =
		useSettingsRoutes();

	const signOut = () => {
		logout();
	};

	return (
		<ScrollView tw="w-full flex-1 mb-16">
			<View tw="my-4 flex-1">
				{profileRoute && (
					<View tw="flex-col">
						<Link href={profileRoute.href}>
							<ProfileRow />
						</Link>
					</View>
				)}
				<MenuList list={mainSettingsRoutes} />
				<MenuList tw="mt-5" title={t('Help')} list={helpRoutes} />
				<Security />
				<MenuList tw="mt-5" title={t('About')} list={aboutRoutes} />
				<View tw="flew-col m-4">
					<Button
						variant="tertiary"
						size="small"
						tw="my-4"
						onPress={signOut}
					>
						{t('Sign Out')}
					</Button>
				</View>
			</View>
		</ScrollView>
	);
};

export function Settings() {
	return (
		<ErrorBoundary>
			<SettingsMenu />
		</ErrorBoundary>
	);
}

export default Settings;
