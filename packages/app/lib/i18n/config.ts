import i18nextConfig, { locizeOptions } from './config.common';
import MMKVStorageBackend from '@diversifiedfinance/i18next-mmkv-backend'; // primary use cache
import Locize from 'i18next-locize-backend';

export * from './config.common';

export default {
	...i18nextConfig,
	backend: {
		backends: [MMKVStorageBackend, Locize],
		backendOptions: [
			{
				prefix: 'i18next_res_',
				expirationTime: 7 * 24 * 60 * 60 * 1000,
			},
			locizeOptions,
		],
		cacheHitMode: 'refreshAndUpdateStore',
	},
};
