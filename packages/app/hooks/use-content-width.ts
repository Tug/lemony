import { MAX_CONTENT_WIDTH } from '@diversifiedfinance/app/constants/layout';
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export enum ContentLayoutOffset {
	HEADER = -240,
}

export function useContentWidth(offset: ContentLayoutOffset = 0) {
	const { width } = useWindowDimensions();
	const contentWidth = useMemo(
		() =>
			width < MAX_CONTENT_WIDTH - offset
				? width
				: MAX_CONTENT_WIDTH - offset,
		[offset, width]
	);
	return contentWidth;
}
