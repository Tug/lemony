// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @type {import('expo/metro-config')}
 */
const { getDefaultConfig } = require('expo/metro-config');
const extraNodeModules = require('node-libs-react-native');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '../..');

const defaultConfig = getDefaultConfig(projectRoot);

module.exports = {
	...defaultConfig,
	watchFolders: [workspaceRoot],
	transformer: {
		...defaultConfig.transformer,
		babelTransformerPath: require.resolve('react-native-svg-transformer'),
		getTransformOptions: async () => ({
			transform: {
				experimentalImportSupport: false,
				inlineRequires: true,
			},
		}),
	},
	resolver: {
		...defaultConfig.resolver,
		extraNodeModules,
		nodeModulesPaths: [
			path.resolve(projectRoot, 'node_modules'),
			path.resolve(workspaceRoot, 'node_modules'),
		],
		assetExts: [...defaultConfig.resolver.assetExts, 'glb', 'gltf'].filter(
			(ext) => ext !== 'svg'
		),
		sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
	},
};
