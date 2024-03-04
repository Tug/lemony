import { Cursor } from './cursor';
import { Header } from './header';
import { DataPoints, Prices } from '@diversifiedfinance/types';
import { Button, Text, View } from '@diversifiedfinance/design-system';
import { SegmentedControl } from '@diversifiedfinance/design-system/segmented-control';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
	Extrapolation,
	interpolate,
	runOnJS,
	runOnUI,
	useAnimatedProps,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { mixPath, useVector } from '@diversifiedfinance/react-native-redash';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent<any, any>(Path);
import { getGraphs, generatePath } from './utils';
import { useComponentSize } from '../../hooks/use-component-size';
import { ViewProps } from '@diversifiedfinance/design-system/view';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { Help } from '@diversifiedfinance/design-system/icon';
import { useIntercom } from '@diversifiedfinance/app/lib/intercom';
import { useTranslation } from 'react-i18next';

export interface MultiScalePriceChartProps {
	width: number;
	height: number;
	aspectRatio?: number;
	prices: Prices;
	disabled?: boolean;
	color?: string;
	precision?: number;
}

// TODO: improve using https://github.com/rainbow-me/rainbow/blob/ecf4adb5e90dcc44659f064825d83e918e9a8924/src/react-native-animated-charts/src/charts/linear/ChartPath.tsx#L78
export const MultiScalePriceChart = ({
	width,
	height,
	prices,
	disabled = false,
	precision = 0,
}: MultiScalePriceChartProps) => {
	const isDark = useIsDarkMode();
	const color = isDark ? colors.white : colors.black;
	// const prices = data.data.prices as Prices;
	const translation = useVector();
	const isActive = useSharedValue(false);
	const transition = useSharedValue(0);
	const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);
	const previous = useSharedValue(0);

	const graphs = useMemo(
		() => getGraphs(prices, width, height),
		[prices, width, height]
	);

	const animatedProps = useAnimatedProps(() => {
		'worklet';
		const previousPath = graphs[previous.value]?.data?.path;
		const currentPath = graphs[currentTabIndex]?.data?.path;
		if (!previousPath && !currentPath) {
			return {};
		}
		return {
			d: mixPath(transition.value, previousPath, currentPath),
		};
	}, [previous, currentTabIndex, graphs, transition]);

	if (graphs.length === 0) {
		return null;
	}

	const handleTabChange = (tabIndex: number) => {
		isActive.value = false;
		previous.value = currentTabIndex;
		transition.value = 0;
		setCurrentTabIndex(tabIndex);
		transition.value = withTiming(1);
	};

	// const style = useAnimatedStyle(() => ({
	// 	transform: [{ translateX: withTiming(BUTTON_WIDTH * current.value) }],
	// 	width: BUTTON_WIDTH,
	// }));

	return (
		<View tw="flex w-full">
			{!disabled && (
				<View tw="w-full p-4">
					<SegmentedControl
						values={graphs.map(({ label }) => label)}
						onChange={handleTabChange}
						selectedIndex={currentTabIndex}
					/>
				</View>
			)}
			<Header
				graphs={graphs}
				width={width}
				height={height}
				isActive={isActive}
				translation={translation}
				index={currentTabIndex}
				precision={precision}
			/>
			<View tw="items-center justify-center">
				<Svg width={width} height={height}>
					<AnimatedPath
						animatedProps={animatedProps}
						onPress={() => {}}
						fill="transparent"
						stroke={color}
						strokeWidth={3}
					/>
				</Svg>
				{!disabled && (
					<Cursor
						graphs={graphs}
						isActive={isActive}
						translation={translation}
						index={currentTabIndex}
						width={width}
						color={color}
						bgColor={
							isDark
								? 'rgba(255, 255, 255, 0.1)'
								: 'rgba(0, 0, 0, 0.1)'
						}
					/>
				)}
				{/*<TimeAxis width={width} graphs={graphs} index={current} />*/}
			</View>
		</View>
	);
};

export type StyledMultiScalePriceChartProps = ViewProps &
	Omit<MultiScalePriceChartProps, 'width'>;

export const StyledMultiScalePriceChart = ({
	tw,
	aspectRatio,
	...rest
}: StyledMultiScalePriceChartProps) => {
	const { t } = useTranslation();
	const [fixedSize, setFixedSize] = useState<{
		width: number;
		height: number;
	}>();
	const {
		onLayout,
		size: { width, height },
	} = useComponentSize();
	const intercom = useIntercom();

	// need to fix the size once and for all
	// otherwise it could increase forever
	useEffect(() => {
		if (width > 0) {
			const heightWithAR = aspectRatio
				? Math.round(width / aspectRatio)
				: height;
			if (
				fixedSize?.width !== width ||
				fixedSize?.height !== heightWithAR
			) {
				setFixedSize({
					width,
					height: heightWithAR,
				});
			}
		}
	}, [width, height, fixedSize, setFixedSize, aspectRatio]);

	return (
		<View tw={tw} onLayout={onLayout}>
			{fixedSize?.width ? (
				<MultiScalePriceChart {...fixedSize} {...rest} />
			) : (
				<View tw="w-full"></View>
			)}
			<View tw="mt-4 flex-row items-center justify-start">
				<Text tw="text-gray-500 dark:text-gray-400">
					{t('Learn more about price estimate')}
				</Text>
				<View tw="mx-1">
					<Button
						variant="text"
						size="xs"
						iconOnly
						onPress={() =>
							intercom.showContent({
								type: 'ARTICLE',
								id: '8617833',
							})
						}
					>
						<Help
							color={colors.blueGray[400]}
							width={16}
							height={16}
						/>
					</Button>
				</View>
			</View>
		</View>
	);
};

export const IconLinePriceChart = ({
	width,
	height,
	data,
	color = 'black',
}: {
	width: number;
	height: number;
	data: DataPoints;
	color?: string;
}) => {
	const strokeWidth = Math.min(3, Math.max(1, Math.round(height / 10)));
	const path = useMemo(
		() => generatePath(data, width, height, strokeWidth),
		[data, width, height, strokeWidth]
	);

	return (
		<Svg width={width} height={height}>
			<Path
				d={path}
				fill="transparent"
				stroke={color}
				strokeWidth={strokeWidth}
			/>
		</Svg>
	);
};

export interface StyledIconLineChartProps extends ViewProps {
	data: DataPoints;
	color?: string;
}

export const StyledIconLinePriceChart = ({
	tw,
	data,
	color,
}: StyledIconLineChartProps) => {
	const {
		onLayout,
		size: { width, height },
	} = useComponentSize();

	return (
		<View tw={tw} onLayout={onLayout}>
			{width && height ? (
				<IconLinePriceChart
					width={width}
					height={height}
					data={data}
					color={color}
				/>
			) : (
				<></>
			)}
		</View>
	);
};

export const styles = StyleSheet.create({
	backgroundSelection: {
		backgroundColor: '#f3f3f3',
		...StyleSheet.absoluteFillObject,
		borderRadius: 8,
	},
	labelContainer: {
		padding: 16,
	},
});
