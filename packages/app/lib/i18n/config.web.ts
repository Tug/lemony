import i18nextConfig, { locizeOptions } from './config.common';
import Locize from 'i18next-locize-backend';

export * from './config.common';

// TODO: https://github.com/locize/i18next-locize-backend#important-advice-for-serverless-environments---aws-lambda-google-cloud-functions-azure-functions-etc
export default {
	...i18nextConfig,
	backend: {
		backends: [Locize],
		backendOptions: [locizeOptions],
		cacheHitMode: 'refresh',
	},
};
