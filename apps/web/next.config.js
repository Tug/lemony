/**
 * @type {import('next').NextConfig}
 */
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { withSentryConfig } = require('@sentry/nextjs');
const withImages = require('next-images');
const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});
const cache = require('./workbox-cache');
const withPWA = require('next-pwa')({
	dest: 'public',
	disable: isDev,
	runtimeCaching: cache,
});

const transpilePackages = [
	'react-native',
	'react-native-web',
	'@gorhom/bottom-sheet',
	'@gorhom/portal',
	'moti',
	'zeego',
	'sentry-expo',
	'solito',
	'nativewind',
	'@shopify/flash-list',
	'@twotalltotems/react-native-otp-input',
	'recyclerlistview',
	'expo',
	'expo-application',
	'expo-av',
	'expo-asset',
	'expo-blur',
	'expo-clipboard',
	'expo-community-flipper',
	'expo-constants',
	'expo-dev-client',
	'expo-device',
	'expo-font',
	'expo-gl',
	'expo-haptics',
	'expo-image-picker',
	'expo-linear-gradient',
	'expo-localization',
	'expo-location',
	'expo-media-library',
	'expo-modules-core',
	'expo-navigation-bar',
	'expo-next-react-navigation',
	'expo-status-bar',
	'expo-system-ui',
	// 'expo-updates',
	'expo-web-browser',
	'expo-next-react-navigation',
	'expo-file-system',
	'react-native-chart-kit',
	'react-native-reanimated',
	'react-native-reanimated-carousel',
	'react-native-gesture-handler',
	'react-native-svg',
	'react-native-avoid-softinput',
	'react-native-safe-area-context',
	'react-native-mmkv',
	'react-native-tab-view',
	'react-native-version-check',
	// '@shopify/react-native-skia',
	'react-native-graph',
	'@react-native-segmented-control/segmented-control',
	'@react-native-community/slider',
	'@diversifiedfinance/app',
	'@diversifiedfinance/react-native-redash',
	'@diversifiedfinance/design-system/extensions/react-native-web',
	'@diversifiedfinance/tailwind-config',
	'@diversifiedfinance/types',
	'@diversifiedfinance/design-system',
	'universal-tooltip',
	'react-native-image-colors',
	'react-native-branch',
];
// const witTM = require('next-transpile-modules')(transpilePackages);

/** @type {import('next').NextConfig} */
const nextConfig = {
	compress: true,
	swcMinify: true,
	reactStrictMode: false,
	experimental: {
		appDir: false,
		optimizeCss: true,
		browsersListForSwc: true,
		legacyBrowsers: false,
		forceSwcTransforms: true,
		windowHistorySupport: true,
		// concurrentFeatures: true,
		// nextScriptWorkers: true,
		scrollRestoration: true,
		swcPlugins: [
			// ['react-native-reanimated-swc-plugin'],
			// ['@nissy-dev/swc-plugin-react-native-web', { commonjs: true }],
		],
		// esmExternals: false,
		// fontLoaders: [
		// 	{ loader: '@next/font/google', options: { subsets: ['latin'] } },
		// ],
		outputFileTracingRoot: path.join(__dirname, '../../'),
		outputFileTracingExcludes: {
			'*': [
				'./**/node_modules/@swc/core-linux-x64-gnu',
				'./**/node_modules/@swc/core-linux-x64-musl',
				'./**/node_modules/@esbuild/linux-x64',
				'./**/node_modules/webpack',
				'./**/node_modules/rollup',
				'./**/node_modules/terser',
			],
		},
	},
	// i18n: {
	// 	locales: ['en-US', 'fr'],
	// 	defaultLocale: 'en-US',
	// },
	transpilePackages,
	typescript: {
		ignoreDevErrors: true,
		// TODO: remove ignoreBuildErrors: true
		// !! WARN !!
		// Dangerously allow production builds to successfully complete even if
		// your project has type errors.
		// !! WARN !!
		ignoreBuildErrors: true,
	},
	// TODO NEXT: remove this
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	webpack: (config, options) => {
		if (!options.isServer) {
			config.resolve.fallback = { fs: false, net: false, tls: false };
		}
		// Mix in aliases
		if (!config.resolve) {
			config.resolve = {};
		}

		// modify storybook's file-loader rule to avoid conflicts with your inline svg
		const fileLoaderRule = config.module.rules.find((rule) =>
			rule.test?.test?.('.svg')
		);
		if (fileLoaderRule) {
			fileLoaderRule.exclude = /\.svg$/;
		}

		config.module.rules = [
			...config.module.rules,
			{
				test: /\.jsx?$/,
				enforce: 'pre',
				use: ['remove-flow-types-loader'],
				include: path.resolve(
					'../../node_modules/@react-native-segmented-control/segmented-control/js'
				),
			},
			{
				test: /\.svg$/i,
				issuer: /\.[jt]sx?$/,
				use: ['@svgr/webpack'],
			},
		];

		config.resolve.alias = {
			...(config.resolve.alias || {}),
			// Alias direct react-native imports to react-native-web
			'react-native$': 'react-native-web',
			'react-native-web/dist/cjs/exports/DrawerLayoutAndroid':
				'react-native-web/dist/cjs/modules/UnimplementedView',
			'react-native/Libraries/Image/AssetRegistry':
				'react-native-web/dist/cjs/modules/AssetRegistry',
		};

		config.resolve.extensions = [
			'.web.js',
			'.web.jsx',
			'.web.ts',
			'.web.tsx',
			...(config.resolve?.extensions ?? []),
		];

		if (!config.plugins) {
			config.plugins = [];
		}

		// Expose __DEV__ from Metro.
		config.plugins.push(
			new options.webpack.DefinePlugin({
				__DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
			})
		);

		// if (options.isServer && process.env.NODE_ENV === 'development') {
		// 	const originalConfigEntry = config.entry;
		// 	config.entry = () => {
		// 		return originalConfigEntry().then((entry) => {
		// 			const scripts = glob.sync('./scripts/*.ts');
		// 			return Object.assign(
		// 				{},
		// 				entry,
		// 				Object.fromEntries(
		// 					scripts.map((filename) => [
		// 						`scripts/${path.basename(filename, '.ts')}`,
		// 						filename,
		// 					])
		// 				)
		// 			);
		// 		});
		// 	};
		// }

		return config;
	},
	images: {
		disableStaticImages: true,
		domains: ['diversified.fi', 'getdiversified.app'],
	},
	async headers() {
		const cacheHeaders = [
			{
				key: 'Cache-Control',
				value: 'public, max-age=31536000, immutable',
			},
		];
		return [
			{ source: '/_next/static/:static*', headers: cacheHeaders },
			{ source: '/fonts/:font*', headers: cacheHeaders },
		];
	},
	async redirects() {
		return [
			{
				source: '/app-store',
				destination:
					'https://apps.apple.com/fr/app/diversified/id6446693590',
				permanent: true,
			},
			{
				source: '/google-play',
				destination:
					'https://play.google.com/store/apps/details?id=fi.diversified.app',
				permanent: true,
			},
		];
	},
	async rewrites() {
		return [
			{
				source: '/testing',
				destination:
					process.env.NODE_ENV === 'production' ? '/404' : '/testing',
			},
			{
				source: '/.well-known/apple-app-site-association',
				destination: '/api/.well-known/apple-app-site-association',
			},
			{
				source: '/.well-known/assetlinks.json',
				destination: '/api/.well-known/assetlinks.json',
			},
			{
				source: '/.well-known/apple-developer-merchantid-domain-association.txt',
				destination:
					process.env.STAGE === 'production'
						? '/.well-known/apple-developer-merchantid-domain-association_prod.txt'
						: '/.well-known/apple-developer-merchantid-domain-association_staging.txt',
			},
		];
	},
};

module.exports = withPlugins(
	[
		withImages,
		withBundleAnalyzer,
		!isDev ? withSentryConfig : null,
		withPWA,
	].filter(Boolean),
	nextConfig
);
