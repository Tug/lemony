import i18n from '@diversifiedfinance/app/lib/i18n';
import i18nextConfig, {
	locizeOptions,
} from '@diversifiedfinance/app/lib/i18n/config';
import LocizeBackend from 'i18next-locize-backend';

const localI18nServerInstances = {};

export async function getI18nServerInstance(lang = 'en', ns = 'server') {
	if (localI18nServerInstances[`${lang} - ${ns}`]) {
		const { createdAt, i18nServer } =
			localI18nServerInstances[`${lang} - ${ns}`];
		// 1 min cache
		if (createdAt < new Date(Date.now() - 1000 * 60)) {
			delete localI18nServerInstances[`${lang} - ${ns}`];
		} else {
			return i18nServer;
		}
	}
	const i18nServer = i18n.createInstance({
		...i18nextConfig,
		// overwriting backend options so we can reliably extract the instance from backendConnector
		backend: locizeOptions,
		ns: [ns],
		defaultNS: ns,
		preload: [lang],
	});

	// TODO NEXT: investigate using i18next-fs-backend or i18next-http-backend
	await i18nServer.use(LocizeBackend).init({});
	if (i18nServer.language !== lang) {
		await i18nServer.changeLanguage(lang);
	}

	localI18nServerInstances[`${lang} - ${ns}`] = {
		createdAt: new Date(),
		i18nServer,
	};

	return i18nServer;
}

export async function addI18nResource(i18nServer, lang, key, value) {
	await new Promise((resolve) => {
		i18nServer.services.backendConnector.backend.writePage(
			i18nextConfig.fallbackLng,
			i18nServer.options.defaultNS,
			[
				{
					key,
					fallbackValue: key,
				},
			],
			resolve
		);
	});
	if (value && key !== value) {
		await new Promise((resolve) => {
			i18nServer.services.backendConnector.backend.writePage(
				lang,
				i18nServer.options.defaultNS,
				[
					{
						key,
						fallbackValue: value,
					},
				],
				resolve
			);
		});
	}
	await i18nServer.reloadResources();
}
