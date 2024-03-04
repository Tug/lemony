import getPath, {
	AllRoutesParams,
} from '@diversifiedfinance/app/navigation/lib/get-path';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { Linking, Platform } from 'react-native';
import { Space, useIntercom } from '@diversifiedfinance/app/lib/intercom';

export type Route = {
	screen?: keyof AllRoutesParams;
	title: string;
	href: string;
	onPress?: (event: Event) => void;
};
export type Routes = Array<Route>;

export const useSettingsRoutes = () => {
	const { t } = useTranslation();
	const { isVerifiedProfile } = useUser();
	const intercom = useIntercom();

	const profileRoute = useMemo(
		() => ({
			key: 'profileSettings',
			title: t('My Profile'),
			href: getPath('profileSettings'),
		}),
		[]
	);

	const mainSettingsRoutes: Routes = useMemo(
		() =>
			[
				{
					key: 'accountSettings',
					title: t('Account Settings'),
					href: getPath('accountSettings'),
				},
				{
					key: 'bankingSettings',
					title: t('Bank Accounts'),
					href: getPath('bankingSettings'),
				},
				!isVerifiedProfile
					? {
							key: 'kycSettings',
							title: t('KYC'),
							href: getPath('kycSettings'),
					  }
					: undefined,
				{
					key: 'referAFriend',
					title: t('Refer a friend 💥'),
					href: getPath('referAFriend'),
				},
				{
					key: 'preferencesSettings',
					title: t('Preferences'),
					href: getPath('preferencesSettings'),
				},
				{
					key: 'notificationSettings',
					title: t('Notifications'),
					href: getPath('notificationSettings'),
				},
			].filter(Boolean),
		[t, isVerifiedProfile]
	);

	const helpRoutes = useMemo(() => {
		if (!intercom.isEnabled) {
			return [];
		}

		return [
			Platform.OS !== 'web' && {
				key: 'howItWorks',
				title: t('How it works?'),
				href: getPath('howItWorks'),
			},
			{
				key: 'helpCenter',
				title: t('Help Center'),
				// short circuit navigation as it fails to detect
				// a window close on android
				onPress: (event: Event) => {
					event?.preventDefault();
					if (Platform.OS === 'web') {
						Linking.openURL('https://help.diversified.fi');
						return;
					}
					intercom.show(Space.helpCenter);
				},
			},
			{
				key: 'contactUs',
				title: t('Contact Us'),
				// short circuit navigation as it fails to detect
				// a window close on android
				onPress: (event: Event) => {
					event?.preventDefault();
					if (Platform.OS === 'web') {
						Linking.openURL('mailto:hello@diversified.fi');
						return;
					}
					intercom.show(Space.messages);
				},
			},
		].filter(Boolean);
	}, [t, intercom]);

	const aboutRoutes = useMemo(
		() =>
			[
				{
					key: 'aboutSettings',
					title: t('App Information'),
					href: getPath('aboutSettings'),
				},
				{
					key: 'legalHub',
					title: t('Legal Hub'),
					// href: 'https://www.diversified.fi/legals-hub',
					onPress: (event: Event) => {
						event?.preventDefault?.();
						Linking.openURL(
							'https://www.diversified.fi/legals-hub'
						);
					},
				},
			].filter(Boolean),
		[t]
	);

	return {
		profileRoute,
		mainSettingsRoutes,
		helpRoutes,
		aboutRoutes,
		allRoutes: [
			profileRoute,
			...mainSettingsRoutes,
			...aboutRoutes,
			...helpRoutes,
		],
	};
};
