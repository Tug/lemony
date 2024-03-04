import i18next from 'i18next';
import type { i18n } from 'i18next';
import {
	initReactI18next,
	// useTranslation as useTranslationOrg,
} from 'react-i18next';
import ChainedBackend from 'i18next-chained-backend';
import config from './config';
import * as formatters from './formatters';
import languageDetector from './language-detector';

export { config };

export type I18n = i18n;

export const init = async () => {
	await i18next
		.use(initReactI18next)
		.use(languageDetector)
		.use(ChainedBackend)
		.init(config, (error) => {
			if (error) {
				throw error;
			}

			formatters.init();
		});
	return i18next;
};

export const getLang = () => {
	return (i18next.language ?? 'en').slice(0, 2);
};

export const reloadTranslations = async () => {
	if (i18next.language === i18next.options.fallbackLng) {
		return;
	}
	await i18next.reloadResources(
		i18next.language || 'en',
		i18next.options.defaultNS || 'app'
	);
};

export default i18next;

// const runsOnServerSide = typeof window === 'undefined';
//
// export function useTranslation(lng: string, ns: string, options: any) {
// 	const ret = useTranslationOrg(ns, options);
// 	const { i18n } = ret;
// 	if (runsOnServerSide && i18n.resolvedLanguage !== lng) {
// 		i18n.changeLanguage(lng);
// 	} else {
// 		// eslint-disable-next-line react-hooks/rules-of-hooks
// 		useEffect(() => {
// 			if (i18n.resolvedLanguage === lng) {
// 				return;
// 			}
// 			i18n.changeLanguage(lng);
// 		}, [lng, i18n]);
// 	}
// 	return ret;
// }
