module.exports = {
	extends: [require.resolve('./jsdoc.js'), 'plugin:json/recommended'],
	rules: {
		'array-bracket-spacing': ['error', 'always'],
		'array-callback-return': 'error',
		'brace-style': ['error', '1tbs'],
		camelcase: [
			'error',
			{
				properties: 'never',
			},
		],
		'comma-dangle': ['error', 'always-multiline'],
		'comma-spacing': 'error',
		'comma-style': ['error', 'last'],
		curly: ['error', 'all'],
		'dot-notation': 'error',
		'eol-last': 'error',
		eqeqeq: 'error',
		'func-call-spacing': 'error',
		indent: ['error', 'tab', { SwitchCase: 1 }],
		'key-spacing': 'error',
		'keyword-spacing': 'error',
		'linebreak-style': ['error', 'unix'],
		'no-alert': 'error',
		'no-bitwise': 'error',
		'no-caller': 'error',
		'no-cond-assign': ['error', 'except-parens'],
		'no-console': 'warn',
		'no-debugger': 'error',
		'no-dupe-args': 'error',
		'no-dupe-keys': 'error',
		'no-duplicate-case': 'error',
		'no-else-return': 'error',
		'no-eval': 'error',
		'no-extra-semi': 'error',
		'no-fallthrough': 'error',
		'no-irregular-whitespace': 'error',
		'no-lonely-if': 'error',
		'no-multi-str': 'error',
		'no-mixed-operators': 'error',
		'no-mixed-spaces-and-tabs': 'error',
		'no-multiple-empty-lines': ['error', { max: 1 }],
		'no-multi-spaces': 'error',
		'no-nested-ternary': 'warn',
		'no-redeclare': 'error',
		'no-shadow': 'error',
		'no-trailing-spaces': 'error',
		'no-undef': 'error',
		'no-undef-init': 'error',
		'no-unreachable': 'error',
		'no-unsafe-negation': 'error',
		'no-unused-expressions': 'error',
		'no-unused-vars': ['error', { ignoreRestSiblings: true }],
		'no-useless-return': 'error',
		'no-whitespace-before-property': 'error',
		'no-with': 'error',
		'object-curly-spacing': ['error', 'always'],
		'one-var-declaration-per-line': ['error', 'initializations'],
		'operator-linebreak': 'error',
		'padded-blocks': ['error', 'never'],
		'quote-props': ['error', 'as-needed'],
		quotes: ['error', 'single', { avoidEscape: true }],
		semi: 'error',
		'semi-spacing': 'error',
		'space-before-blocks': ['error', 'always'],
		'space-before-function-paren': [
			'error',
			{
				anonymous: 'never',
				named: 'never',
				asyncArrow: 'always',
			},
		],
		'space-in-parens': ['error', 'always'],
		'space-infix-ops': 'error',
		'space-unary-ops': [
			'error',
			{
				overrides: {
					'!': true,
				},
			},
		],
		'valid-typeof': 'error',
		'vars-on-top': 'error',
		'wrap-iife': 'error',
	},
};
