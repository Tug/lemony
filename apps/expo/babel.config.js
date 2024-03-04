const path = require('path');
const fs = require('fs');

const STAGE = process.env.STAGE ?? 'production';
const envPath = path.resolve(__dirname, `.env.${STAGE}`);

// TODO: don't know any better way to do this! We need to add E2E variable in RN env.
if (process.env.E2E) {
	fs.appendFileSync(envPath, '\nE2E=true');
}

module.exports = function (api) {
	api.cache(true);

	require('dotenv').config({
		path: envPath,
	});

	const plugins = [
		['inline-dotenv', { path: envPath }],
		'react-native-reanimated/plugin',
		'@babel/plugin-transform-flow-strip-types',
		['@babel/plugin-transform-class-properties', { loose: true }],
		['@babel/plugin-transform-private-methods', { loose: true }],
		[
			'module-resolver',
			{
				alias: {
					crypto: 'react-native-quick-crypto',
					stream: 'stream-browserify',
					buffer: '@craftzdog/react-native-buffer',
					'bn.js': 'react-native-bignumber',
				},
			},
		],
		['nativewind/babel', { mode: 'compileOnly' }],
		// https://expo.github.io/router/docs/intro#configure-the-babel-plugin
		// require.resolve('expo-router/babel'),
	];

	// if (process.env.I18N_EXTRACT) {
	// 	plugins.push([
	// 		'i18next-extract',
	// 		{
	// 			locales: ['en'],
	// 			outputPath: 'locales/{{locale}}/{{ns}}.json',
	// 			defaultNS: 'app',
	// 			keyAsDefaultValue: ['en'],
	// 			keySeparator: null,
	// 			nsSeparator: null,
	// 		},
	// 	]);
	// }

	if (process.env.NODE_ENV === 'test') {
		plugins.push('dynamic-import-node');
	}

	return {
		presets: [['babel-preset-expo', { jsxRuntime: 'automatic' }]],
		plugins,
	};
};
