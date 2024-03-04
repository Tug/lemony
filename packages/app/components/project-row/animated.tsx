import { useNavigateToProject } from '../../navigation/lib/use-navigate-to';
import { useFirstProjectImage } from '@diversifiedfinance/app/hooks/use-wordpress-image';
import { Image, PressableScale } from '@diversifiedfinance/design-system';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { Project } from '@diversifiedfinance/types';
import React, { ReactNode, Fragment, useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import { usePrice } from '../../hooks/api-hooks';
import { Trans, useTranslation } from 'react-i18next';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { CircularProgress } from '@diversifiedfinance/components/circular-progress';
import Animated, {
	measure,
	Easing,
	Extrapolation,
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const timingConfig = {
	duration: 240,
	easing: Easing.bezier(0.33, 0.01, 0, 1),
};

export interface ProjectRowProps {
	item: Project;
	itemHeight?: number;
	labels?: ReactNode[];
}

export function ProjectRow({
	item,
	itemHeight,
	labels,
}: ProjectRowProps): React.ReactElement {
	const { t } = useTranslation();
	const [firstImage] = useFirstProjectImage(item);
	const navigateToProject = useNavigateToProject();
	const percentLeft = 100 - item.percent;
	const percentProgress = percentLeft / 100;
	const { isLoading: isPriceLoading, data: prices } = usePrice(
		item.tokenSymbol
	);
	const animationProgress = useSharedValue(0);
	const tapGesture = Gesture.Tap().onEnd((_, success) => {
		if (!success) return;
		animationProgress.value = withTiming(
			animationProgress.value === 1 ? 0 : 1,
			timingConfig
		);
	});
	const imageStyles = useAnimatedStyle(() => {
		const interpolateProgress = (range: [number, number]) =>
			interpolate(
				animationProgress.value,
				[0, 1],
				range,
				Extrapolation.CLAMP
			);

		return {
			width: `${interpolateProgress([20, 100])}%`,
			height: interpolateProgress([120, 300]),
		};
	}, [animationProgress]);

	const hasPriceHistory =
		isPriceLoading || Object.keys(prices ?? {}).length > 1;
	return (
		<GestureDetector gesture={tapGesture}>
			{/*<PressableScale onPress={() => showDetails((isVisible) => !isVisible)}>*/}
			<View
				tw={['mb-4 rounded-2xl border border border-gray-200 bg-white']}
				dataset={Platform.select({ web: { testId: 'project-row' } })}
			>
				<Animated.View
					style={[
						{
							alignItems: 'center',
						},
						imageStyles,
					]}
				>
					<Image
						style={{
							width: '100%',
							height: '100%',
						}}
						resizeMode="contain"
						source={{ uri: firstImage?.source_url }}
						alt="Project cover image"
						borderRadius={30}
					/>
				</Animated.View>
				<View tw="flex-row justify-items-stretch m-4 pb-2">
					<View tw="flex-row mr-4 w-16 h-full items-center"></View>
					<View tw="shrink grow flex-col">
						<View tw="absolute h-6 top-[-28px] flex-row">
							{labels?.map((label, index) => (
								<Fragment key={index}>{label}</Fragment>
							))}
						</View>
						<View tw="my-2">
							<Text tw="text-base font-bold">{item.title}</Text>
						</View>
						<View tw="mt-2 flex-row">
							<View tw="flex-1 mt-2 border-r border-[#E2E8F0]">
								<View tw="">
									<Text tw="text-themeNight text-base font-bold">
										{item.expectedAPR}%
									</Text>
								</View>
								<View tw="mt-2">
									{hasPriceHistory ? (
										<Text tw="mt-4 text-xs font-bold text-gray-500">
											{t(
												'Avg. annual historical appreciation'
											)}
										</Text>
									) : (
										<Text tw="mt-4 text-xs font-bold text-gray-500">
											{t(
												'Avg. annual appreciation of comparable products'
											)}
										</Text>
									)}
								</View>
							</View>
							<View tw="ml-3 mt-2 flex-1 flex-col justify-center">
								<View tw="flex-row">
									<CircularProgress
										size={36}
										strokeBgColor={colors.gray[200]}
										strokeColor={colors.diversifiedBlue}
										strokeWidth={6}
										progress={percentProgress}
										strokeLinecap="round"
									></CircularProgress>
									<View tw="flex-col ml-2 justify-center shrink grow">
										<View tw="my-1">
											<Text tw="text-base font-bold text-diversifiedBlue">{`${percentLeft.toFixed(
												0
											)}%`}</Text>
										</View>
										<View tw="my-1">
											<Text tw="text-xs text-diversifiedBlue">
												{t('Left for sale')}
											</Text>
										</View>
									</View>
								</View>
								{/*<View>*/}
								{/*	<Text tw="mt-4 text-sm font-bold text-gray-500">*/}
								{/*		{t('Funding progress')}*/}
								{/*	</Text>*/}
								{/*</View>*/}
							</View>
						</View>
					</View>
				</View>
			</View>
			{/*</PressableScale>*/}
		</GestureDetector>
	);
}
