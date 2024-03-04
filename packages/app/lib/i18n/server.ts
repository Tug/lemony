// import i18next from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import Locize from 'i18next-locize-backend';
// import config from './config';
// import * as formatters from './formatters';
//
// export { config };
//
// export const init = async () => {
// 	await i18next
// 		.use(initReactI18next)
// 		.use(Locize)
// 		// .use(
// 		// 	resourcesToBackend((language, namespace) =>
// 		// 		import(`./locales/${language}/${namespace}.json`)
// 		// 	)
// 		// )
// 		.init(config, (error) => {
// 			if (error) {
// 				throw error;
// 			}
//
// 			formatters.init();
// 		});
// 	return i18next;
// };
//
// export default i18next;
//
// export async function useTranslation(
// 	lang: string,
// 	ns: string | string[],
// 	options: any = {}
// ) {
// 	// it's ok not to memo, SSR only runs a hook once.
// 	const i18nextInstance = await init();
// 	return {
// 		t: i18nextInstance.getFixedT(
// 			lang,
// 			Array.isArray(ns) ? ns[0] : ns,
// 			options.keyPrefix
// 		),
// 		i18n: i18nextInstance,
// 	};
// }
