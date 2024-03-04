import SettingsHeader from '../header';
import { ThemePreference } from './local/theme';
import { LocalePreference } from './user/locale';
import { ExperimentalPreference } from './local/experimental';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

type PreferencesSettingsProps = {};

export const PreferencesSettings = ({}: PreferencesSettingsProps) => {
	const { t } = useTranslation();

	return (
		<>
			<SettingsHeader title={t('App Preferences')} />
			<ScrollView>
				<ThemePreference />
				<LocalePreference />
				<ExperimentalPreference />
			</ScrollView>
		</>
	);
};

export default PreferencesSettings;
