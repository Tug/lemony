import { Image, View } from '@diversifiedfinance/design-system';
import React, { FC, useEffect, useState } from 'react';
import Carousel from 'react-native-reanimated-carousel';
import Animated, { Easing } from 'react-native-reanimated';
import { SlideProps } from '@diversifiedfinance/app/components/onboarding/home/index';
import { Dimensions } from 'react-native';

export function ImageCarousel({
	images,
	width,
	height,
	initialReverse,
	totalDuration = 18000,
}) {
	const [isReverse, setReverse] = useState<boolean>(!!initialReverse);
	const imageDuration = totalDuration / images.length;

	useEffect(() => {
		const interval = setInterval(() => {
			setReverse((reverse) => !reverse);
		}, totalDuration);
		return () => clearInterval(interval);
	}, []);

	return (
		<Carousel<FC<SlideProps>>
			loop
			autoPlay
			autoPlayInterval={0}
			autoPlayReverse={isReverse}
			width={width}
			height={height}
			data={images}
			renderItem={({ item: src, index }) => (
				<View
					key={index.toString()}
					tw="p-2"
					style={{
						width,
						height,
					}}
				>
					<Image
						tw="rounded-2xl"
						style={{
							width: '100%',
							height: '100%',
						}}
						source={{
							uri: src,
						}}
						alt="Image"
					/>
				</View>
			)}
			vertical={false}
			pagingEnabled={false}
			overscrollEnabled={true}
			enabled={false}
			withAnimation={{
				type: 'timing',
				config: {
					duration: imageDuration,
					easing: Easing.linear,
				},
			}}
			style={{ width: Dimensions.get('window').width }}
		/>
	);
}
