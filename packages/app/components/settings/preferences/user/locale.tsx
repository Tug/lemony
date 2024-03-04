import PreferencesEntry from '../entry';
import { useTranslation } from 'react-i18next';
import { useIntercom } from '@diversifiedfinance/app/lib/intercom';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import i18next from 'i18next';
import { usePreference } from '@diversifiedfinance/app/hooks/use-preference';

type AvailableLanguages = Record<string, { nativeName: string }>;

export const LocalePreference = () => {
	const languages: AvailableLanguages = {
		en: { nativeName: 'English' },
		fr: { nativeName: 'Français' },
	};
	const { t, i18n } = useTranslation();
	const intercom = useIntercom();
	const { user } = useUser();
	const [_, setLocalePreference] = usePreference('locale');

	const onLanguageChange = (newLang: string) => {
		i18next.changeLanguage(newLang);
		setLocalePreference(newLang);
		intercom.updateUser(user);
	};

	return (
		<PreferencesEntry
			preferenceName={t('Language')}
			currentValue={i18n.language}
			optionsValues={Object.keys(languages)}
			optionsLabels={(lang) => languages[lang]?.nativeName}
			onChange={onLanguageChange}
		/>
	);
};
