/**
 * External dependencies
 */
const browserslist = require('browserslist');

module.exports = (api) => {
	const isTestEnv = api.env() === 'test';

	const getPresetEnv = () => {
		const opts = {
			include: [
				'proposal-nullish-coalescing-operator',
				'proposal-logical-assignment-operators',
			],
		};

		if (isTestEnv) {
			opts.targets = {
				node: 'current',
			};
		} else {
			opts.modules = false;
			const localBrowserslistConfig = browserslist.findConfig('.') || {};
			opts.targets = {
				browsers:
					localBrowserslistConfig.defaults ||
					require('@diversifiedfinance/browserslist-config'),
			};
		}

		return [require.resolve('@babel/preset-env'), opts];
	};

	const maybeGetPluginTransformRuntime = () => {
		if (isTestEnv) {
			return undefined;
		}

		const opts = {
			helpers: true,
			useESModules: false,
		};

		return [require.resolve('@babel/plugin-transform-runtime'), opts];
	};

	return {
		presets: [getPresetEnv(), require.resolve('@babel/preset-typescript')],
		plugins: [maybeGetPluginTransformRuntime()].filter(Boolean),
	};
};
