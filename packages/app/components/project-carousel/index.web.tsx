import { Project } from '@diversifiedfinance/types';
import React, { useCallback, useState } from 'react';
import { View } from '@diversifiedfinance/design-system';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import {
	Dimensions,
	LayoutChangeEvent,
	StyleProp,
	ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import {
	ProjectCardBase,
	ProjectCardSmall,
} from '@diversifiedfinance/app/components/project-card';

export interface ProjectCarouselProps {
	cardType?: 'base' | 'small';
	height?: number;
	projects: Project[];
	color?: string;
}

export function ProjectCarousel({
	projects,
	cardType = 'base',
	color = undefined,
}: ProjectCarouselProps) {
	const height = cardType === 'base' ? 340 : 180;
	const isDark = useIsDarkMode();
	const bgColor = color ?? (isDark ? colors.gray[900] : colors.white);
	const [width, setWidth] = useState(Dimensions.get('window').width);
	const itemWidth = 0.8 * width;

	const onLayout = useCallback(
		({ nativeEvent: { layout } }: LayoutChangeEvent) => {
			setWidth(layout.width);
		},
		[setWidth]
	);

	return (
		<View tw="my-4 flex-row flex-wrap gap-y-4" onLayout={onLayout}>
			{projects.map((item, index) => (
				<ProjectCarouselCard
					key={item.slug}
					itemHeight={height}
					itemWidth={itemWidth}
					cardType={cardType}
					item={item}
					style={{ backgroundColor: bgColor }}
				/>
			))}
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
