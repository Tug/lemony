import editorSettings from './editor-settings.json';

const VARIABLE_REFERENCE_PREFIX = 'var:';
const VARIABLE_PATH_SEPARATOR_TOKEN_ATTRIBUTE = '|';
const VARIABLE_PATH_SEPARATOR_TOKEN_STYLE = '--';

const colors = editorSettings.colors.reduce((acc, { slug, color }) => {
	acc[slug] = color;
	return acc;
}, {} as Record<string, string>);

const gradients = editorSettings.gradients.reduce((acc, { slug, gradient }) => {
	acc[slug] = gradient;
	return acc;
}, {} as Record<string, string>);

const getCSSValue = (value: string) => {
	if (!value) {
		return undefined;
	}
	if (colors[value]) {
		return colors[value];
	}
	if (gradients[value]) {
		return gradients[value];
	}
	if (value?.startsWith?.(VARIABLE_REFERENCE_PREFIX)) {
		const variable = value
			.slice(VARIABLE_REFERENCE_PREFIX.length)
			.split(VARIABLE_PATH_SEPARATOR_TOKEN_ATTRIBUTE)
			.join(VARIABLE_PATH_SEPARATOR_TOKEN_STYLE);
		const cssVarName = `--wp--${variable}`;
		const match = editorSettings.styles[0].css.match(
			new RegExp(`${cssVarName}: (.+?);`)
		)?.[1];
		if (match) {
			return match;
		}
	}
	return value;
};

const getCSSColor = (value: string) => {
	if (value.startsWith('#') || value.startsWith('rgb')) {
		return value;
	}
	if (colors[value]) {
		return colors[value];
	}
	if (gradients[value]) {
		return gradients[value];
	}
	return getCSSValue(`var:${value}`);
};

export const translateAllStyles = (
	inputStyles: any,
	prefix: string = ''
): Record<string, string | number> => {
	const outputStyles: Record<string, string | number> = {};
	if (!inputStyles) {
		return outputStyles;
	}
	for (const property in inputStyles) {
		const cssValue = getCSSValue(inputStyles[property]);
		if (cssValue) {
			const keyProp = prefix
				? `${prefix}${
						property.charAt(0).toUpperCase() + property.slice(1)
				  }`
				: property;
			outputStyles[keyProp] = cssValue;
		}
	}
	return outputStyles;
};

/**
 * Example usage:
 * <View style={translateBlockStyles(style)}>
 * 	{renderBlocks(innerBlocks)}
 * </View>
 *
 * @param  blockStyles
 */
export const translateBlockStyles = (
	blockStyles: any
): Record<string, string | number> => {
	if (!blockStyles) {
		return {};
	}

	return {
		...translateAllStyles(blockStyles.spacing.margin, 'margin'),
		...translateAllStyles(blockStyles.spacing.padding, 'padding'),
		...translateAllStyles(blockStyles.dimensions),
		...translateAllStyles(blockStyles.border, 'border'),
		...(blockStyles.color?.text && { color: blockStyles.color.text }),
		...(blockStyles.color?.background && {
			backgroundColor: blockStyles.color.background,
		}),
	};
};
