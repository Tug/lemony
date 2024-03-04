import * as Localization from 'expo-localization';
import { getPreference } from '@diversifiedfinance/app/lib/preferences';

const languageDetector = {
	type: 'languageDetector',
	async: true,
	detect: (callback: (locale: string) => void) => {
		const localePreference = getPreference('locale');
		if (localePreference) {
			callback(localePreference);
			return;
		}
		callback(Localization.locale.split('-')[0]);
	},
	init: () => {},
	cacheUserLanguage: () => {},
};

export default languageDetector;
