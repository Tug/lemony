import { useHeaderHeight } from '../../lib/react-navigation/elements';
import { useColorScheme } from '@diversifiedfinance/design-system/color-scheme';
import { View } from '@diversifiedfinance/design-system/view';
import { Skeleton } from 'moti/skeleton';
import React, { useMemo, useRef } from 'react';
import { useWindowDimensions } from 'react-native';

export interface ProjectScreenCardSkeletonProps {
	itemHeight?: number;
}

export function ProjectScreenCardSkeleton({
	itemHeight,
}: ProjectScreenCardSkeletonProps): React.ReactElement {
	const headerHeight = useHeaderHeight();
	const headerHeightRef = useRef(headerHeight);
	const { width: windowWidth, height: windowHeight } = useWindowDimensions();
	const bottomHeight = 0;
	const maxContentHeight = windowHeight;

	const mediaWidth = windowWidth - 48;
	const mediaHeight = useMemo(() => {
		const aspectRatio = 1.2;
		const actualHeight = mediaWidth / aspectRatio;

		if (
			actualHeight <
			windowHeight - bottomHeight - headerHeightRef.current
		) {
			return Math.min(actualHeight, maxContentHeight);
		}

		return windowHeight - bottomHeight;
	}, [bottomHeight, maxContentHeight, windowHeight, mediaWidth]);

	return (
		<View
			tw={[
				'max-w-2xl flex-1 bg-white opacity-100 dark:bg-gray-900',
				itemHeight ? 'overflow-hidden pt-24' : '',
			]}
			style={itemHeight ? { height: itemHeight } : {}}
		>
			<View
				tw={[
					'mb-8 w-full flex-col justify-around px-4',
					itemHeight ? 'h-full' : '',
				]}
				shouldRasterizeIOS={true}
			>
				<Skeleton width={mediaWidth} height={mediaHeight}></Skeleton>
				<View tw="pb-2 pt-4">
					<Skeleton width={mediaWidth}></Skeleton>
				</View>
				<View tw="my-2 max-h-32">
					<Skeleton width={mediaWidth} height={96}></Skeleton>
				</View>
				<View tw="my-2 max-h-32 flex-row">
					<Skeleton
						width={mediaWidth / 3 - 8}
						height={118}
					></Skeleton>
					<View tw="w-4"></View>
					<Skeleton
						width={mediaWidth / 3 - 8}
						height={118}
					></Skeleton>
					<View tw="w-4"></View>
					<Skeleton
						width={mediaWidth / 3 - 8}
						height={118}
					></Skeleton>
				</View>
				<View tw="mb-24 mt-6">
					<Skeleton
						width={mediaWidth}
						height={48}
						radius="round"
					></Skeleton>
				</View>
			</View>
		</View>
	);
}
