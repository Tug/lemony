import type { InitOptions } from 'i18next';
import { Platform } from 'react-native';

export const fallback = 'en';
export const supportedLocales = [fallback, 'fr'] as const;

export const defaultNamespace = 'app';

export const namespaces = [defaultNamespace, 'design-system'];

const IS_SSR = typeof window === 'undefined';

export const locizeOptions = {
	projectId: process.env.NEXT_PUBLIC_LOCIZE_PROJECTID,
	apiKey: process.env.LOCIZE_API_KEY, // should not be set in production
	referenceLng: fallback,
	...(IS_SSR && { reloadInterval: false }),
};

export const localStorageOptions = {
	expirationTime: 24 * 60 * 60 * 1000, // 1 day
};

const i18nextConfig: InitOptions<typeof locizeOptions> = {
	// TODO NEXT: plural support with https://github.com/eemeli/intl-pluralrules
	//  Remove compatibilityJSON: v3
	compatibilityJSON: 'v3',
	debug: false, //__DEV__ && !IS_SSR,
	saveMissing: process.env.NODE_ENV !== 'production',
	fallbackLng: fallback,
	referenceLng: fallback,
	ns: namespaces,
	defaultNS: defaultNamespace,
	keySeparator: false,
	nsSeparator: false,
	react: {
		useSuspense: Platform.OS === 'web',
		// force rerender when language changes + bundle resource is reloaded
		bindI18n: 'languageChanged loaded',
	},
};

export default i18nextConfig;
