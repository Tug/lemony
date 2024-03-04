import React, { memo, useCallback, useMemo, useState } from 'react';
import { View } from '@diversifiedfinance/design-system';
import { FlatList, Dimensions, LayoutChangeEvent } from 'react-native';
import { TopCarouselCard, TopCarouselCardProps } from './card';

export interface TopCarouselProps {
	height?: number;
	data: any[];
	pagination?: { variant: 'dot' | 'rectangle' };
}

export function TopCarousel({
	height = 98,
	data,
	pagination,
}: TopCarouselProps) {
	const [width, setWidth] = useState(Dimensions.get('window').width);
	const itemWidth = 0.9 * width;

	const onLayout = useCallback(
		({ nativeEvent: { layout } }: LayoutChangeEvent) => {
			setWidth(layout.width);
		},
		[setWidth]
	);

	const renderItem = useCallback(
		({ item, index }: { item: TopCarouselCardProps; index: number }) => (
			<View style={{ width: itemWidth, height }} key={index.toString()}>
				<TopCarouselCard {...item} />
			</View>
		),
		[itemWidth, height]
	);

	return (
		<View
			tw={['mt-4 overflow-visible', pagination ? 'mb-12' : 'mb-6']}
			onLayout={onLayout}
		>
			<FlatList
				style={{ overflow: 'visible' }}
				data={data}
				horizontal
				showsHorizontalScrollIndicator={false}
				snapToAlignment="start"
				decelerationRate={'fast'}
				slidesPerView={1.2}
				snapToInterval={itemWidth + 16}
				renderItem={renderItem}
				ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
			/>
		</View>
	);
}
