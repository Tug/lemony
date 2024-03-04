const { version } = require('./package');

/**
 * Regular expression string matching a SemVer string with equal major/minor to
 * the current package version. Used in identifying deprecations.
 *
 * @type {string}
 */
const majorMinorRegExp =
	version.replace(/\.\d+$/, '').replace(/[\\^$.*+?()[\]{}|]/g, '\\$&') +
	'(\\.\\d+)?';

module.exports = {
	extends: [
		'next',
		'plugin:import/recommended',
		'plugin:@diversifiedfinance/eslint-plugin/recommended',
		'plugin:eslint-comments/recommended',
	],
	settings: {
		next: {
			rootDir: ['apps/*/', 'packages/*/'],
		},
		jsdoc: {
			mode: 'typescript',
		},
		// 'import/resolver': {
		// 	node: {
		// 		extensions: [
		// 			'.js',
		// 			'.jsx',
		// 			'.ts',
		// 			'.tsx',
		// 			'.native.js',
		// 			'.native.jsx',
		// 			'.native.ts',
		// 			'.native.tsx',
		// 		],
		// 	},
		// },
	},
	rules: {
		camelcase: 'off',
		'import/default': 'off',
		'import/no-extraneous-dependencies': 'off',
		'import/no-unresolved': 'off',
		'import/named': 'off',
		// 'import/ignore': [ 'react-native' ], // Workaround for https://github.com/facebook/react-native/issues/28549.
		'@diversifiedfinance/data-no-store-string-literals': 'off',
		'jest/expect-expect': 'off',
		'@diversifiedfinance/react-no-unsafe-timeout': 'error',
		// '@diversifiedfinance/i18n-text-domain': [
		// 	'error',
		// 	{
		// 		allowedTextDomain: 'default',
		// 	},
		// ],
		'no-restricted-imports': [
			'error',
			{
				paths: [
					{
						name: 'framer-motion',
						message:
							'Please use the Framer Motion API through `@diversifiedfinance/components` instead.',
					},
					{
						name: '@emotion/css',
						message:
							'Please use `@emotion/react` and `@emotion/styled` in order to maintain iframe support. As a replacement for the `cx` function, please use the `useCx` hook defined in `@diversifiedfinance/components` instead.',
					},
				],
			},
		],
		'no-restricted-syntax': [
			'error',
			// NOTE: We can't include the forward slash in our regex or
			// we'll get a `SyntaxError` (Invalid regular expression: \ at end of pattern)
			// here. That's why we use \\u002F in the regexes below.
			// {
			// 	selector:
			// 		'ImportDeclaration[source.value=/^@diversifiedfinance\\u002F.+\\u002F/]',
			// 	message:
			// 		'Path access on Diversified dependencies is not allowed.',
			// },
			{
				selector:
					'CallExpression[callee.name="deprecated"] Property[key.name="version"][value.value=/' +
					majorMinorRegExp +
					'/]',
				message:
					'Deprecated functions must be removed before releasing this version.',
			},
			{
				selector:
					'CallExpression[callee.object.name="page"][callee.property.name="waitFor"]',
				message:
					'This method is deprecated. You should use the more explicit API methods available.',
			},
			{
				selector:
					'CallExpression[callee.object.name="page"][callee.property.name="waitForTimeout"]',
				message: 'Prefer page.waitForSelector instead.',
			},
			{
				selector: 'JSXAttribute[name.name="id"][value.type="Literal"]',
				message:
					'Do not use string literals for IDs; use withInstanceId instead.',
			},
			{
				// Discourage the usage of `Math.random()` as it's a code smell
				// for UUID generation, for which we already have a higher-order
				// component: `withInstanceId`.
				selector:
					'CallExpression[callee.object.name="Math"][callee.property.name="random"]',
				message:
					'Do not use Math.random() to generate unique IDs; use withInstanceId instead. (If you’re not generating unique IDs: ignore this message.)',
			},
			{
				selector:
					'CallExpression[callee.name="withDispatch"] > :function > BlockStatement > :not(VariableDeclaration,ReturnStatement)',
				message:
					'withDispatch must return an object with consistent keys. Avoid performing logic in `mapDispatchToProps`.',
			},
			{
				selector:
					'LogicalExpression[operator="&&"][left.property.name="length"][right.type="JSXElement"]',
				message:
					'Avoid truthy checks on length property rendering, as zero length is rendered verbatim.',
			},
		],
	},
	env: {
		browser: true,
		node: true,
		es6: true,
	},
	root: true,
};
