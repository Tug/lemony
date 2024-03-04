const typescriptTransform = require('i18next-scanner-typescript');

module.exports = {
	input: [
		'App.tsx',
		'../../packages/app/**/*.{js,jsx,ts,tsx}',
		'../../packages/blocks/**/*.{js,jsx,ts,tsx}',
		'../../packages/components/**/*.{js,jsx,ts,tsx}',
		'../../packages/design-system/country-code-picker/*.{js,jsx,ts,tsx}',
		'!../../packages/app/lib/i18n/**',
		'!**/node_modules/**',
	],
	output: './',
	options: {
		debug: true,
		func: {
			list: ['i18next.t', 'i18n.t', 't'],
			extensions: ['.js', '.jsx'],
		},
		trans: {
			component: 'Trans',
			// i18nKey: 'i18nKey',
			// defaultsKey: 'defaults',
			extensions: ['.js', '.jsx'],
			fallbackKey: (ns, value) => {
				return value?.replace(/\s+/g, ' ').trim();
			},
			// https://react.i18next.com/latest/trans-component#usage-with-simple-html-elements-like-less-than-br-greater-than-and-others-v10.4.0
			supportBasicHtmlNodes: true, // Enables keeping the name of simple nodes (e.g. <br/>) in translations instead of indexed keys.
			keepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'], // Which nodes are allowed to be kept in translations during defaultValue generation of <Trans>.
			// https://github.com/acornjs/acorn/tree/master/acorn#interface
			acorn: {
				ecmaVersion: 2020,
				sourceType: 'module', // defaults to 'module'
			},
		},
		lngs: ['en', 'fr'],
		ns: ['app', 'design-system'],
		defaultLng: 'en',
		defaultNs: 'app',
		defaultValue(lng, ns, key) {
			if (lng === 'en') {
				// Return key as the default value for English language
				return key;
			}
			// Return the string '__NOT_TRANSLATED__' for other languages
			return '__NOT_TRANSLATED__';
		},
		resource: {
			loadPath: 'i18n/{{lng}}/{{ns}}.json',
			savePath: 'i18n/{{lng}}/{{ns}}.json',
			jsonIndent: 2,
			lineEnding: '\n',
		},
		nsSeparator: false,
		keySeparator: false,
		interpolation: {
			prefix: '{{',
			suffix: '}}',
		},
		allowDynamicKeys: false,
		// metadata: {},
	},
	transform: typescriptTransform({
		extensions: ['.ts', '.tsx'],
		// tsOptions: require('./tsconfig.json'),
		tsOptions: {
			target: 'es2018',
		},
	}),
};
