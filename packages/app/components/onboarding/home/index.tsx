import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { Button, Text, View } from '@diversifiedfinance/design-system';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
	interpolate,
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
} from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { useTranslation } from 'react-i18next';
import { ImageCarousel } from '@diversifiedfinance/app/components/onboarding/home/image-carousel';
import { Slide } from '@diversifiedfinance/app/components/onboarding/home/slide';
import {
	useSafeAreaInsets,
	SafeAreaView,
} from '@diversifiedfinance/design-system/safe-area';
import { images } from '../image-assets';
import { useComponentSize } from '@diversifiedfinance/app/hooks/use-component-size';

const Slide1: React.FC<{}> = () => {
	const { t } = useTranslation();
	return (
		<Slide
			tw="bg-themeNight"
			theme="dark"
			title={t('We believe in the strength of the collective.')}
			subtitle={t('Co-invest in Luxury assets')}
		/>
	);
};

const Slide2 = () => {
	const { t } = useTranslation();
	return (
		<Slide
			tw="bg-themePurple"
			theme="light"
			title={t('Choose your own savings strategy.')}
			subtitle={t(
				'Our asset scoring helps you decide based on your financial objectives'
			)}
		/>
	);
};

const Slide3 = () => {
	const { t } = useTranslation();
	return (
		<Slide
			tw="bg-black"
			theme="dark"
			title={t('Everyone should be treated like a millionaire.')}
			subtitle={t(
				'Sign up to access the most exciting investment opportunities.'
			)}
		/>
	);
};

const Slide4 = () => {
	const { t } = useTranslation();
	return (
		<Slide
			tw="bg-themeYellow"
			theme="light"
			title={t('All-in-one investment solution.')}
			subtitle={t(
				'Product procurement, storage, insurance, and resale, all handled by us.'
			)}
		/>
	);
};

const slides = [Slide1, Slide2, Slide3, Slide4];

const imageSet1 = images.slice(0, 8);
const imageSet2 = images.slice(8, 16);

export interface SlideProps {}

export interface OnboardingProps {}

function OnboardingHome({}: OnboardingProps) {
	const { top: safeAreaTop, bottom: safeAreaBottom } = useSafeAreaInsets();
	const progressValue = useSharedValue<number>(0);
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const animationStyle = useCallback((value: number) => {
		'worklet';

		const zIndex = interpolate(value, [-1, 0, 1], [10, 20, 30]);
		const opacity = interpolate(value, [-0.75, 0, 1], [0, 1, 0]);

		return {
			zIndex,
			opacity,
		};
	}, []);
	const {
		onLayout,
		size: { width, height },
	} = useComponentSize({
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
	});
	const imageCarouselHeight = Math.round(Dimensions.get('window').height / 6);

	const progressFadeAnimationStyle = useAnimatedStyle(() => {
		const currIndex = Math.floor(progressValue.value);
		const currentColor = currIndex % 2 === 0 ? '#fff' : '#000';
		const nextColor = currIndex % 2 === 0 ? '#000' : '#fff';
		const backgroundColor = interpolateColor(
			progressValue.value,
			[currIndex, currIndex + 0.5, currIndex + 1],
			[currentColor, '#808080', nextColor]
		);
		return {
			backgroundColor,
		};
	}, [progressValue, currentIndex]);

	return (
		<View tw="h-full w-full" onLayout={onLayout}>
			<Carousel<FC<SlideProps>>
				loop
				autoPlay
				autoPlayInterval={5000}
				onProgressChange={(offsetProgress, absoluteProgress) => {
					progressValue.value = absoluteProgress;
					const newIndex =
						Math.round(absoluteProgress) % slides.length;
					if (currentIndex !== newIndex) {
						setCurrentIndex(newIndex);
					}
				}}
				width={width}
				height={height}
				data={slides}
				renderItem={({ item: SlideComponent }) => <SlideComponent />}
				customAnimation={animationStyle}
			/>
			<View
				tw="absolute left-4 right-4 top-0 flex-row items-start gap-1"
				style={{ marginTop: safeAreaTop }}
			>
				{slides.map((slide, index) => (
					<Animated.View
						key={index.toString()}
						style={[
							{
								height: 4,
								flexGrow: 1,
								borderRadius: 4,
								opacity: index === currentIndex ? 1 : 0.5,
							},
							progressFadeAnimationStyle,
						]}
					></Animated.View>
				))}
			</View>
			<View tw="absolute w-full" style={{ top: imageCarouselHeight }}>
				<ImageCarousel
					images={imageSet1}
					width={Math.round(imageCarouselHeight * 1.75)}
					height={imageCarouselHeight}
				/>
				<ImageCarousel
					images={imageSet2}
					width={imageCarouselHeight}
					height={imageCarouselHeight}
					initialReverse={true}
				/>
			</View>
			<View
				tw="absolute bottom-0 left-4 right-4 flex-col"
				style={{
					marginBottom: safeAreaBottom,
				}}
			>
				<View tw="my-4 flex-row justify-center gap-3">
					{slides.map((slide, index) => (
						<View
							key={index}
							tw="h-2 w-2 rounded bg-white"
							style={{
								opacity: index === currentIndex ? 1 : 0.5,
							}}
						></View>
					))}
				</View>
			</View>
		</View>
	);
}

export default OnboardingHome;
