import { useWordPressImage } from '@diversifiedfinance/app/hooks/use-wordpress-image';
import { Image, View } from '@diversifiedfinance/design-system';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import ChevronLeft from '@diversifiedfinance/design-system/icon/ChevronLeft';
import ChevronRight from '@diversifiedfinance/design-system/icon/ChevronRight';
import { PressableHover } from '@diversifiedfinance/design-system/pressable-hover';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import React, { useCallback, useState } from 'react';
import { Dimensions, LayoutChangeEvent, Platform } from 'react-native';
import Animated, {
	Extrapolate,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
} from 'react-native-reanimated';
import { Carousel } from '@diversifiedfinance/app/lib/carousel';
import { WP_Block_Parsed } from 'wp-types';

function SlideshowImage({ imageId }: { imageId: number }) {
	const { data: image } = useWordPressImage(imageId);
	const isDark = useIsDarkMode();

	return (
		<Image
			resizeMode="contain"
			style={{
				width: '100%',
				height: '100%',
				backgroundColor: isDark ? '#000' : '#fff',
			}}
			source={{ uri: image?.source_url }}
			alt={image?.alt_text}
		/>
	);
}

const noop = () => {};

export default function SlideshowBlock({ attrs: { ids } }: WP_Block_Parsed) {
	const isDark = useIsDarkMode();
	const carouselRef = React.useRef(null);
	const [width, setWidth] = useState(Dimensions.get('window').width);
	const progressValue = useSharedValue<number>(0);
	const itemIds: number[] = ids ?? [];

	const onLayout = useCallback(
		({ nativeEvent: { layout } }: LayoutChangeEvent) => {
			setWidth(layout.width);
		},
		[setWidth]
	);

	return (
		<View tw="my-4" onLayout={onLayout}>
			<Carousel
				ref={carouselRef}
				loop
				width={width}
				height={350}
				autoPlay={false}
				data={itemIds}
				scrollAnimationDuration={1000}
				onSnapToItem={(index) => noop}
				onProgressChange={(_, absoluteProgress) =>
					(progressValue.value = absoluteProgress)
				}
				renderItem={({ index }) => (
					<SlideshowImage imageId={ids[index]} />
				)}
				controller={Platform.OS === 'web'}
			/>
			{!!progressValue && (
				<View
					style={{
						position: 'absolute',
						bottom: 5,
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignSelf: 'center',
					}}
				>
					{itemIds.map((itemId, index) => {
						return (
							<PaginationItem
								animValue={progressValue}
								index={index}
								key={index}
								length={itemIds.length}
							/>
						);
					})}
				</View>
			)}
		</View>
	);
}

const PaginationItem: React.FC<{
	index: number;
	length: number;
	animValue: Animated.SharedValue<number>;
}> = (props) => {
	const { animValue, index, length } = props;
	const width = 10;

	const animStyle = useAnimatedStyle(() => {
		let inputRange = [index - 1, index, index + 1];
		let outputRange = [-width, 0, width];

		if (index === 0 && animValue?.value > length - 1) {
			inputRange = [length - 1, length, length + 1];
			outputRange = [-width, 0, width];
		}

		return {
			transform: [
				{
					translateX: interpolate(
						animValue?.value,
						inputRange,
						outputRange,
						Extrapolate.CLAMP
					),
				},
			],
		};
	}, [animValue, index, length]);

	return (
		<View
			style={{
				backgroundColor: colors.gray[500],
				width,
				height: width,
				borderRadius: 50,
				overflow: 'hidden',
				marginHorizontal: 6,
			}}
		>
			<Animated.View
				style={[
					{
						borderRadius: 50,
						backgroundColor: colors.gray[100],
						flex: 1,
					},
					animStyle,
				]}
			/>
		</View>
	);
};
