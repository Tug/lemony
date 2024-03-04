/** @typedef {import('prettier').Config} PrettierConfig */

/**
 * @typedef WPPrettierOptions
 *
 * @property {boolean} [parenSpacing=true] Insert spaces inside parentheses.
 */

// Disable reason: The current JSDoc tooling does not yet understand TypeScript
// union types.
/** @type {PrettierConfig & WPPrettierOptions} */
const config = {
	useTabs: true,
	tabWidth: 4,
	printWidth: 80,
	singleQuote: true,
	trailingComma: 'es5',
	bracketSameLine: false,
	bracketSpacing: true,
	semi: true,
	arrowParens: 'always',
	parser: 'babel-ts',
	importOrder: [
		'./shim',
		'raf/polyfill',
		'setimmediate',
		'^(react|react-native)$',
		'<THIRD_PARTY_MODULES>',
		'^@diversifiedfinance(.*)$',
		'^[./]',
	],
	importOrderSeparation: true,
	plugins: [require('./merged-prettier-plugin.js')],
	tailwindAttributes: ['tw'],
};

module.exports = config;
