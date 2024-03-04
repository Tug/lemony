module.exports = {
	plugins: ['@diversifiedfinance'],
	rules: {
		'@diversifiedfinance/no-unused-vars-before-return': 'error',
		'react-hooks/exhaustive-deps': [
			'error',
			{
				additionalHooks:
					'(useAnimatedStyle|useDerivedValue|useAnimatedProps)',
			},
		],
	},
	overrides: [
		{
			files: ['*.native.js'],
			rules: {
				'@diversifiedfinance/i18n-no-flanking-whitespace': 'error',
				'@diversifiedfinance/i18n-hyphenated-range': 'error',
			},
		},
	],
};
