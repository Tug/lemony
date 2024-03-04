// Based on https://github.com/rainbow-me/rainbow/blob/3e2059381cc30e988196cbadaee6fd0e41673b3d/src/design-system/typography/typography.ts
const { precomputeValues } = require('@capsizecss/core');

const fontFamily = (font) => {
	return `"${font.replace(/-/g, ' ')}"`;
};

const roundToNearestPixel = (layoutSize) => {
	const ratio = 1;
	return Math.round(layoutSize * ratio) / ratio;
};

const capsize = (options) => {
	const values = precomputeValues(options);
	const fontSize = parseFloat(values.fontSize);
	const baselineTrimEm = parseFloat(values.baselineTrim);
	const capHeightTrimEm = parseFloat(values.capHeightTrim);
	const fontScale = 1; // TODO:

	return {
		fontSize,
		lineHeight:
			values.lineHeight !== 'normal'
				? parseFloat(values.lineHeight)
				: undefined,
		marginBottom: roundToNearestPixel(
			baselineTrimEm * fontSize * fontScale
		),
		marginTop: roundToNearestPixel(capHeightTrimEm * fontSize * fontScale),
	};
};

const createTextSize = ({
	fontSize,
	lineHeight: leading,
	letterSpacing,
	marginCorrection,
	fontMetrics,
}) => {
	const styles = {
		letterSpacing,
		...capsize({
			fontMetrics,
			fontSize,
			leading,
		}),
	};

	const marginCorrectionForPlatform = 0;

	const newStyle = {
		fontSize: styles.fontSize,
		lineHeight: `${styles.lineHeight}px`,
		letterSpacing: styles.letterSpacing,
		marginTop: roundToNearestPixel(
			styles.marginTop + marginCorrectionForPlatform
		),
		marginBottom: roundToNearestPixel(
			styles.marginBottom - marginCorrectionForPlatform
		),
	};

	return newStyle;
};

// Sourced from @capsizecss/metrics
const fontMetricsInter = {
	familyName: 'Inter',
	capHeight: 2048,
	ascent: 2728,
	descent: -680,
	lineGap: 20,
	unitsPerEm: 2816,
	xHeight: 1536,
};

// Used https://vertical-metrics.netlify.app/
const fontMetricsBrickText = {
	familyName: 'BrickText',
	capHeight: 700,
	ascent: 910,
	descent: -260,
	lineGap: 20,
	unitsPerEm: 1000,
	xHeight: 508,
};

const textSizes = {
	'text-xs': createTextSize({
		fontSize: 12,
		letterSpacing: 0.6,
		lineHeight: 15,
		marginCorrection: {
			android: -0.1,
			ios: -0.3,
		},
		fontMetrics: fontMetricsInter,
	}),
	'text-13': createTextSize({
		fontSize: 13,
		letterSpacing: 0,
		lineHeight: 16,
		marginCorrection: {
			android: -0.1,
			ios: -0.3,
		},
		fontMetrics: fontMetricsInter,
	}),
	'text-sm': createTextSize({
		fontSize: 14,
		letterSpacing: 0,
		lineHeight: 17,
		marginCorrection: {
			android: -0.1,
			ios: -0.3,
		},
		fontMetrics: fontMetricsInter,
	}),
	'text-15': createTextSize({
		fontSize: 15,
		lineHeight: 18,
		marginCorrection: {
			android: -0.1,
			ios: -0.4,
		},
		fontMetrics: fontMetricsInter,
	}),
	'text-base': createTextSize({
		fontSize: 16,
		letterSpacing: 0,
		lineHeight: 19,
		marginCorrection: {
			android: -0.1,
			ios: -0.5,
		},
		fontMetrics: fontMetricsInter,
	}),
	'text-lg': createTextSize({
		fontSize: 18,
		letterSpacing: 0,
		lineHeight: 21,
		marginCorrection: {
			android: 0.2,
			ios: 0,
		},
		fontMetrics: fontMetricsBrickText,
	}),
	'text-xl': createTextSize({
		fontSize: 20,
		letterSpacing: 0,
		lineHeight: 23,
		marginCorrection: {
			android: 0,
			ios: -0.5,
		},
		fontMetrics: fontMetricsBrickText,
	}),
	'text-2xl': createTextSize({
		fontSize: 24,
		letterSpacing: 0,
		lineHeight: 27,
		marginCorrection: {
			android: -0.3,
			ios: -0.3,
		},
		fontMetrics: fontMetricsBrickText,
	}),
	'text-3xl': createTextSize({
		fontSize: 30,
		letterSpacing: 0,
		lineHeight: 33,
		marginCorrection: {
			android: -0.3,
			ios: -0.3,
		},
		fontMetrics: fontMetricsBrickText,
	}),
	'text-4xl': createTextSize({
		fontSize: 36,
		letterSpacing: 0.6,
		lineHeight: 41,
		marginCorrection: {
			android: -0.3,
			ios: -0.3,
		},
		fontMetrics: fontMetricsBrickText,
	}),
};

module.exports = { fontFamily, capsize, createTextSize, textSizes };
