const config = {
	extends: [
		require.resolve('./jsx-a11y.js'),
		require.resolve('./custom.js'),
		require.resolve('./esnext.js'),
	],
	plugins: ['import'],
	env: {
		node: true,
	},
	globals: {
		window: true,
		document: true,
		wp: 'readonly',
	},
	settings: {
		'import/extensions': ['.js', '.jsx'],
	},
	rules: {
		'import/default': 'warn',
		'import/named': 'warn',
	},
};

module.exports = config;
