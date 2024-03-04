import { useAlert } from '@diversifiedfinance/design-system/alert';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import VersionCheck from 'react-native-version-check-expo';
import { Linking } from 'react-native';
import { usePreference } from '@diversifiedfinance/app/hooks/use-preference';

const getMajorVersion = (appVersion: string): number => {
	return Number(appVersion.split('.')?.[0]);
};

export const useAlertOnNewVersion = () => {
	const Alert = useAlert();
	const { t } = useTranslation();
	const [lastDismissedVersion, setLastDismissedVersion] = usePreference(
		'dismissed-update-version'
	);

	const showUpdateDialog = (res: {
		latestVersion: string;
		storeUrl: string;
	}) =>
		Alert.alert(
			t('New Version Available'),
			t(
				'A new version of Diversified is available on the app store. Please update to use our newest features.',
				{ latestVersion: res.latestVersion }
			),
			[
				{
					text: t('Dismiss'),
					style: 'cancel',
					onPress: async () => {
						setLastDismissedVersion(res.latestVersion);
					},
				},
				{
					text: t('Update Now'),
					onPress: async () => {
						setLastDismissedVersion(res.latestVersion);
						Linking.openURL(res.storeUrl).catch((error) => {
							console.error(error);
						});
					},
				},
			]
		);

	useEffect(() => {
		if (process.env.STAGE !== 'production') {
			return;
		}
		VersionCheck.needUpdate().then((res) => {
			if (
				res &&
				res.isNeeded &&
				res.storeUrl &&
				res.latestVersion &&
				getMajorVersion(res.latestVersion) >
					getMajorVersion(lastDismissedVersion ?? '0')
			) {
				showUpdateDialog(res);
			}
		});
	}, []);
};
