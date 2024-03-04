import React, { useCallback, useRef } from 'react';
import Animated, {
	interpolate,
	interpolateColor,
	useAnimatedStyle,
} from 'react-native-reanimated';
import type { AnimateProps } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import type {
	StyleProp,
	ViewStyle,
	ViewProps,
	ImageURISource,
} from 'react-native';
import { colors } from '@diversifiedfinance/design-system/tailwind';

import { images } from '../image-assets';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 24,
		overflow: 'hidden',
	},
	image: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
	},
});

interface SBItemProps extends AnimateProps<ViewProps> {
	style?: StyleProp<ViewStyle>;
	index?: number;
}

export const SBItem: React.FC<SBItemProps> = (props) => {
	const { style, index, testID, ...animatedViewProps } = props;
	const source = React.useRef<ImageURISource>({
		uri: images[(index || 0) % 16],
	}).current;

	return (
		<Animated.View
			testID={testID}
			style={{ flex: 1 }}
			{...animatedViewProps}
		>
			<Animated.View testID={testID} style={[styles.container, style]}>
				<Image
					key={index}
					style={styles.image}
					source={source}
					alt="carousel image"
				/>
			</Animated.View>
		</Animated.View>
	);
};

interface CustomItemProps {
	index: number;
	animationValue: Animated.SharedValue<number>;
	bgColor?: string;
}

const CustomItem: React.FC<CustomItemProps> = ({
	index,
	animationValue,
	bgColor = 'transparent',
}) => {
	const maskStyle = useAnimatedStyle(() => {
		const backgroundColor = interpolateColor(
			animationValue.value,
			[0, 1],
			['transparent', bgColor]
		);

		return {
			backgroundColor,
		};
	}, [animationValue]);

	return (
		<View style={{ flex: 1 }}>
			<SBItem key={index} index={index} />
			<Animated.View
				pointerEvents="none"
				style={[
					{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						borderRadius: 24,
					},
					maskStyle,
				]}
			/>
		</View>
	);
};

export function CardImageCarousel({
	width = 200,
	height = 200,
	skewAngle = 15,
}) {
	const isDark = useIsDarkMode();
	const backgroundColors = [
		colors.themeNight,
		colors.themeYellow,
		isDark ? colors.white : colors.black,
		colors.themePurple,
	];
	const scale = 0.8;
	const spaceBetweenCardsRatio = 0.1;
	const cardWidth = width / scale;
	const cardHeight = height / scale;

	const animationStyle = useCallback(
		(value: number) => {
			'worklet';

			const zIndex = interpolate(value, [-1, 0, 1], [10, 20, -10]);
			const scale = interpolate(value, [-1, 0, 1], [1.25, 1, 1]);
			const rotateZ = `${interpolate(
				value,
				[-1, 0, 1],
				[-45 - skewAngle, -skewAngle, skewAngle]
			)}deg`;
			const translateX = interpolate(
				value,
				[-1, 0, 1],
				[
					-cardWidth,
					-cardWidth * spaceBetweenCardsRatio,
					cardWidth * spaceBetweenCardsRatio,
				]
			);
			const opacity = interpolate(value, [-0.75, 0, 1, 2], [0, 1, 1, 0]);

			return {
				transform: [{ scale }, { rotateZ }, { translateX }],
				zIndex,
				opacity,
			};
		},
		[scale, cardWidth, cardHeight]
	);

	return (
		<Carousel
			loop
			style={{
				width: Dimensions.get('window').width,
				height: cardHeight,
				justifyContent: 'center',
				alignItems: 'center',
			}}
			width={width}
			height={height}
			data={[...new Array(6).keys()]}
			renderItem={({ index, animationValue }) => {
				return (
					<CustomItem
						key={index}
						index={index}
						bgColor={
							backgroundColors[index % backgroundColors.length]
						}
						animationValue={animationValue}
					/>
				);
			}}
			autoPlay={true}
			autoPlayInterval={5000}
			scrollAnimationDuration={1000}
			customAnimation={animationStyle}
		/>
	);
}
