import PreferencesEntry from '../entry';
import { useTranslation } from 'react-i18next';
import { usePreference } from '@diversifiedfinance/app/hooks/use-preference';
import { Platform } from 'react-native';

export const ExperimentalPreference = () => {
	const { t } = useTranslation();
	const [currentValue, setCurrentValue] = usePreference(
		'experimental-features',
		{
			saveOnProfile: false,
		}
	);

	if (Platform.OS === 'web') {
		return null;
	}

	return (
		<PreferencesEntry<boolean>
			preferenceName={t('Enable experimental features')}
			currentValue={Boolean(currentValue)}
			onChange={setCurrentValue}
		/>
	);
};
