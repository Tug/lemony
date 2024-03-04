import React, { memo, useCallback, useMemo, useState } from 'react';
import { View } from '@diversifiedfinance/design-system';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { Dimensions, LayoutChangeEvent } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { TopCarouselCard, TopCarouselCardProps } from './card';
import Animated, {
	Extrapolate,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
} from 'react-native-reanimated';
import { colors } from '@diversifiedfinance/design-system/tailwind';

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
	const progressValue = useSharedValue<number>(0);
	const carouselRef = React.useRef(null);
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
			<View tw="flex-1 ml-4" key={index.toString()}>
				<TopCarouselCard {...item} />
			</View>
		),
		[]
	);

	return (
		<View
			tw={['mt-4 overflow-visible -mx-4', pagination ? 'mb-6' : 'mb-2']}
			onLayout={onLayout}
		>
			<Carousel
				loop
				controller
				ref={carouselRef}
				width={itemWidth}
				style={{
					width,
				}}
				height={height * 1.1}
				onProgressChange={(_, absoluteProgress) => {
					progressValue.value = absoluteProgress;
				}}
				panGestureHandlerProps={{
					activeOffsetX: [-10, 10],
				}}
				data={data}
				renderItem={renderItem}
			/>
			{pagination && !!progressValue && data.length > 1 && (
				<View
					tw="absolute -bottom-4 z-10 w-full flex-row items-center justify-center"
					style={{ zIndex: 999 }}
				>
					{data.map((_, index) => {
						const PaginationItem =
							pagination?.variant === 'dot'
								? PaginationDotItem
								: PaginationRectangleItem;
						return (
							<PaginationItem
								animValue={progressValue}
								index={index}
								key={index}
								length={data.length}
							/>
						);
					})}
				</View>
			)}
		</View>
	);
}

type PaginationItemProps = {
	index: number;
	length: number;
	animValue: Animated.SharedValue<number>;
	isRotate?: boolean;
};

const PaginationDotItem = memo(function PaginationDotItem({
	animValue,
	index,
	length,
}: PaginationItemProps) {
	const width = 8;
	const isDark = useIsDarkMode();
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
			tw="ml-2 h-2 w-2 overflow-hidden rounded-full"
			style={{
				backgroundColor: isDark ? colors.gray[500] : colors.gray[200],
			}}
		>
			<Animated.View
				style={[
					{
						borderRadius: 50,
						backgroundColor: isDark
							? colors.white
							: colors.gray[400],
						flex: 1,
					},
					animStyle,
				]}
			/>
		</View>
	);
});

const PaginationRectangleItem = memo<PaginationItemProps>(
	function PaginationRectangleItem({ animValue, index, length }) {
		const isDark = useIsDarkMode();
		const width = 24;
		const animStyle = useAnimatedStyle(() => {
			let inputRange = [index - 1, index, index + 1];
			let outputRange = [width / 2, width, width / 2];

			if (index === 0 && animValue?.value > length - 1) {
				inputRange = [length - 1, length, length + 1];
				outputRange = [width / 2, width, width / 2];
			}

			return {
				width: interpolate(
					animValue?.value,
					inputRange,
					outputRange,
					Extrapolate.CLAMP
				),
			};
		}, [animValue, index, length]);
		return (
			<View tw="ml-2 h-2 overflow-hidden rounded-full bg-white">
				<Animated.View
					style={[
						{
							borderRadius: 50,
							backgroundColor: isDark
								? colors.gray[800]
								: colors.gray[300],
							flex: 1,
						},
						animStyle,
					]}
				/>
			</View>
		);
	}
);
