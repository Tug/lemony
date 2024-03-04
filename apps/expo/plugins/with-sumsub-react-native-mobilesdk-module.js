const path = require('path');
const fs = require('fs');
const {
	createRunOncePlugin,
	withProjectBuildGradle,
	withDangerousMod,
	withAppBuildGradle,
} = require('@expo/config-plugins');

// Because we need the package to be added AFTER the React and Google maven packages, we create a
// new allprojects. It's ok to have multiple allprojects.repositories, so we create a new one since
// it's cheaper than tokenizing the existing block to find the correct place to insert.
const gradleMaven =
	'allprojects { repositories { maven { url "https://maven.sumsub.com/repository/maven-public/" } } }';

function setGradleMaven(buildGradle) {
	if (buildGradle.includes('maven.sumsub.com')) {
		return buildGradle;
	}

	return `${buildGradle}\n${gradleMaven}\n`;
}

const withAndroidSumsubMaven = (config) => {
	return withProjectBuildGradle(config, (gradleConfig) => {
		if (gradleConfig.modResults.language === 'groovy') {
			// eslint-disable-next-line no-param-reassign
			gradleConfig.modResults.contents = setGradleMaven(
				gradleConfig.modResults.contents
			);
		} else {
			throw new Error(
				'Cannot add Sumsub maven respository because the build.gradle is not groovy'
			);
		}

		return gradleConfig;
	});
};

const withCustomAppBuildGradle = (config) => {
	return withAppBuildGradle(config, (newConfig) => {
		if (
			newConfig.modResults.contents.includes(
				`all*.exclude module: 'bcprov-jdk15to18'`
			)
		) {
			return newConfig;
		}

		newConfig.modResults.contents = newConfig.modResults.contents.replace(
			`compileSdkVersion rootProject.ext.compileSdkVersion`,
			`compileSdkVersion rootProject.ext.compileSdkVersion

// fix Duplicate class org.bouncycastle... errors
configurations {
	all*.exclude module: 'bcprov-jdk15to18'
	all*.exclude module: 'bcutil-jdk15to18'
}`
		);
		return newConfig;
	});
};

const withNewPodfile = (config) => {
	return withDangerousMod(config, [
		'ios',
		async (c) => {
			const filePath = path.join(
				c.modRequest.platformProjectRoot,
				'Podfile'
			);
			const contents = fs.readFileSync(filePath, 'utf-8');

			const results = contents.includes(
				"source 'https://cdn.cocoapods.org/'"
			)
				? contents
				: `source 'https://cdn.cocoapods.org/'
source 'https://github.com/SumSubstance/Specs.git'

# Enable MRTDReader (NFC) module
#ENV['IDENSIC_WITH_MRTDREADER'] = 'true'

# Enable VideoIdent module
#ENV['IDENSIC_WITH_VIDEOIDENT'] = 'true'

${contents}`;
			fs.writeFileSync(filePath, results);

			return c;
		},
	]);
};

const withSumsub = (config) => {
	config = withAndroidSumsubMaven(config);
	config = withCustomAppBuildGradle(config);
	config = withNewPodfile(config);
	return config;
};

module.exports = createRunOncePlugin(withSumsub, 'sumsub');
