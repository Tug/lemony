import { View } from '@diversifiedfinance/design-system';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors, styled } from '@diversifiedfinance/design-system/tailwind';
import { Children, useCallback, useMemo, useState } from 'react';
import { Dimensions, LayoutChangeEvent } from 'react-native';
import RenderHtml, { defaultSystemFonts } from 'react-native-render-html';

const systemFonts = [
	...defaultSystemFonts,
	'Inter-Regular',
	'Inter-SemiBold',
	'Inter-Bold',
	'BrickText-Black',
];

const tagsStyles = {
	span: { fontFamily: 'Inter-Regular' },
	p: { fontFamily: 'Inter-Regular' },
	h1: { fontFamily: 'BrickText-Black' },
	h2: { fontFamily: 'BrickText-Black' },
	h3: { fontFamily: 'BrickText-Black' },
	h4: { fontFamily: 'BrickText-Black' },
};

function RawHTML({ children, style, ...props }: any) {
	let rawHtml = '';
	const isDark = useIsDarkMode();

	// Cast children as an array, and concatenate each element if it is a string.
	Children.toArray(children).forEach((child) => {
		if (typeof child === 'string' && child.trim() !== '') {
			rawHtml += child;
		}
	});

	const [viewWidth, setViewWidth] = useState(Dimensions.get('window').width);
	const onLayout = useCallback(
		({
			nativeEvent: {
				layout: { width },
			},
		}: LayoutChangeEvent) => {
			setViewWidth(width);
		},
		[viewWidth]
	);

	const baseStyle = useMemo(
		() =>
			Object.assign(
				{
					fontFamily: 'Inter-Regular',
					fontSize: '1rem',
					lineHeight: '1.25rem',
					color: isDark ? colors.gray[100] : colors.gray[900],
				},
				...(style ?? [])
			),
		[isDark, style]
	);

	// TODO NEXT: support ellipsis for native
	return (
		<View tw="w-full" {...props} onLayout={onLayout}>
			<RenderHtml
				contentWidth={viewWidth}
				source={{ html: rawHtml }}
				systemFonts={systemFonts}
				tagsStyles={tagsStyles}
				baseStyle={baseStyle}
			/>
		</View>
	);
}

export default styled(RawHTML);
