// @ts-check
const { getTsconfig } = require('get-tsconfig');
const { pathsToModuleNameMapper } = require('ts-jest');
const tsConfigFile = './tsconfig.jest.json';

const { getJestCachePath } = require('../../cache.config');

const packageJson = require('./package.json');

/**
 * Transform the tsconfig paths into jest compatible one (support extends)
 *
 * @param {string} tsConfigFile
 */
const tsConfigBasePaths = (() => {
	const parsedTsConfig = getTsconfig(tsConfigFile);
	if (parsedTsConfig === null) {
		throw new Error(`Cannot find tsconfig file: ${tsConfigFile}`);
	}
	const tsPaths = parsedTsConfig.config.compilerOptions?.paths;
	return tsPaths
		? pathsToModuleNameMapper(tsPaths, {
				prefix: '<rootDir>/src',
		  })
		: {};
})();

// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
	dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
	cacheDirectory: getJestCachePath(packageJson.name),
	// Add more setup options before each test is run
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
	// if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
	moduleDirectories: ['node_modules', '<rootDir>/'],

	// If you're using [Module Path Aliases](https://nextjs.org/docs/advanced-features/module-path-aliases),
	// you will have to add the moduleNameMapper in order for jest to resolve your absolute paths.
	// The paths have to be matching with the paths option within the compilerOptions in the tsconfig.json
	// For example:

	moduleNameMapper: {
		// '@/(.*)$': '<rootDir>/src/$1',
		...tsConfigBasePaths,
	},
	moduleFileExtensions: [
		'web.tsx',
		'tsx',
		'web.ts',
		'ts',
		'web.jsx',
		'jsx',
		'web.js',
		'js',
	],

	testEnvironment: 'jest-environment-jsdom',
	// false by default, overrides in cli, ie: yarn test:unit --collect-coverage=true
	collectCoverage: false,
	coverageDirectory: '<rootDir>/coverage',
	collectCoverageFrom: [
		'<rootDir>/**/*.{ts,tsx,js,jsx}',
		'!**/*.test.{js,ts}',
		'!**/__tests__/*',
		'!**/__mocks__/*',
		'!**/*.d.ts',
		'!**/node_modules/**',
	],
	transform: {
		// Use babel-jest to transpile tests with the next/babel preset
		// https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
		'^.+\\.(js|jsx|ts|tsx)$': [
			'babel-jest',
			{ presets: ['next/babel', '@babel/preset-flow'] },
		],
	},
	transformIgnorePatterns: require('../expo/package.json').jest
		.transformIgnorePatterns,
	preset: 'jest-expo/web',
	//preset: 'react-native',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
