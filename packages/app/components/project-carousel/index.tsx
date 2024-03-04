import { Project } from '@diversifiedfinance/types';
import React, { useCallback, useMemo, useState } from 'react';
import {
	Pressable,
	PressableScale,
	View,
} from '@diversifiedfinance/design-system';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import ChevronLeft from '@diversifiedfinance/design-system/icon/ChevronLeft';
import ChevronRight from '@diversifiedfinance/design-system/icon/ChevronRight';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import {
	Dimensions,
	LayoutChangeEvent,
	Platform,
	StyleProp,
	ViewStyle,
} from 'react-native';
import Animated, {
	Extrapolate,
	interpolate,
	useAnimatedStyle,
} from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import {
	ProjectCardBase,
	ProjectCardSmall,
} from '@diversifiedfinance/app/components/project-card';
import { useNavigateToProject } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';

export interface ProjectCarouselProps {
	cardType?: 'base' | 'small';
	height?: number;
	projects: Project[];
	color?: string;
}

const carouselConfig: {
	[cardType in (typeof ProjectCarouselProps)['cardType']]: any;
} = {
	base: {
		loop: false,
		autoPlay: false,
		// mode: 'parallax',
		// modeConfig: {
		// 	parallaxScrollingScale: 1,
		// 	parallaxScrollingOffset: 0,
		// 	parallaxAdjacentItemScale: 1,
		// },
	},
	small: {
		loop: false,
		autoPlay: false,
		width: 168,
	},
};

export function ProjectCarousel({
	projects,
	cardType = 'base',
	showButtons = false,
	color = undefined,
}: ProjectCarouselProps) {
	const height = cardType === 'base' ? 340 : 180;
	const isDark = useIsDarkMode();
	const bgColor = color ?? (isDark ? colors.gray[900] : colors.white);
	const activeColor = isDark ? 'white' : 'black';
	const carouselRef = React.useRef(null);
	const [width, setWidth] = useState(Dimensions.get('window').width);
	const itemWidth = 0.8 * width;

	const onLayout = useCallback(
		({ nativeEvent: { layout } }: LayoutChangeEvent) => {
			setWidth(layout.width);
		},
		[setWidth]
	);

	return (
		<View tw="my-4 overflow-visible" onLayout={onLayout}>
			<Carousel<Project>
				loop
				ref={carouselRef}
				width={itemWidth}
				style={{
					width,
				}}
				height={height * 1.1}
				panGestureHandlerProps={{
					activeOffsetX: [-10, 10],
				}}
				data={projects}
				renderItem={({ item, index, animationValue }) => (
					<ProjectCarouselCard
						key={item.slug}
						itemHeight={height}
						itemWidth={itemWidth}
						cardType={cardType}
						item={item}
						animationValue={animationValue}
						style={{ backgroundColor: bgColor }}
					/>
				)}
				{...carouselConfig[cardType]}
			/>
			{showButtons && (
				<View tw="items-center mt-4">
					<View tw="flex-row">
						<PressableScale
							onPress={() => carouselRef.current?.prev()}
						>
							<View
								tw="mx-1 h-12 w-12 items-center justify-center rounded-full border"
								style={{ borderColor: activeColor }}
							>
								<ChevronLeft
									width={16}
									height={16}
									color={color}
								/>
							</View>
						</PressableScale>
						<PressableScale
							onPress={() => carouselRef.current?.next()}
						>
							<View
								tw="mx-1 h-12 w-12 items-center justify-center rounded-full border"
								style={{ borderColor: activeColor }}
							>
								<ChevronRight
									width={16}
									height={16}
									color={color}
								/>
							</View>
						</PressableScale>
					</View>
				</View>
			)}
		</View>
	);
}

function ProjectCarouselCard({
	item,
	itemHeight = 380,
	cardType = 'base',
	animationValue,
	style,
}: {
	item: Project;
	itemHeight: number;
	cardType: 'base' | 'small';
	animationValue: Animated.SharedValue<number>;
	style?: StyleProp<ViewStyle>;
}) {
	if (cardType === 'base') {
		return (
			<ProjectCardBase
				item={item}
				itemHeight={itemHeight}
				inCarousel
				showProgress={false}
			/>
		);
	}

	return (
		<ProjectCardSmall
			item={item}
			itemHeight={itemHeight}
			inCarousel
			style={style}
		/>
	);
}

const noop = () => {};

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
