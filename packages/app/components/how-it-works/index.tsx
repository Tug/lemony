import { Button, Image, Text, View } from '@diversifiedfinance/design-system';
import React, { FC, ReactNode, useCallback } from 'react';
import { useNavigateToScreen } from '../../navigation/lib/use-navigate-to';
import OnboardingScreen from '../onboarding/components/screen';
import { useTranslation } from 'react-i18next';
import { Dimensions } from 'react-native';
import { Carousel } from '@diversifiedfinance/app/lib/carousel';
import Animated, {
	Extrapolate,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
} from 'react-native-reanimated';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { getStaticImage } from '@diversifiedfinance/app/utilities';
import { createParam } from '@diversifiedfinance/app/navigation/lib/use-param';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

const InfoBox = ({
	icon,
	title,
	description,
}: {
	icon: ReactNode;
	title: string;
	description: string;
}) => (
	<View tw="mx-4 mb-4 p-4 rounded-xl border border-white dark:border-gray-300 bg-themeNight dark:bg-gray-900">
		{icon && <View tw="mb-3">{icon}</View>}
		<View tw="my-2">
			<Text tw="text-xl font-bold text-white">{title}</Text>
		</View>
		<View tw="my-1">
			<Text tw="text-sm text-white">{description}</Text>
		</View>
	</View>
);

const Slide1 = () => {
	const { t } = useTranslation();
	return (
		<InfoBox
			title={t('1. Listing')}
			description={t('of a high-yield asset.')}
		/>
	);
};

const Slide2 = () => {
	const { t } = useTranslation();
	return (
		<InfoBox
			title={t('2. Co-investment')}
			description={t(
				'The asset is divided into €10 shares called DIFIED.'
			)}
		/>
	);
};

const Slide3 = () => {
	const { t } = useTranslation();
	return (
		<InfoBox
			title={t('3. Appreciation')}
			description={t(
				'A period of 3 to 7 years during which you can track the estimated value of your portfolio.\n' +
					'And make new investments.'
			)}
		/>
	);
};

const Slide4 = () => {
	const { t } = useTranslation();
	return (
		<InfoBox
			title={t('4. Sale')}
			description={t(
				'The asset is sold at the best price within 6 months of the end ' +
					'of the investment period. You will then be credited with the net of the sale!'
			)}
		/>
	);
};

const PaginationItem: React.FC<{
	index: number;
	length: number;
	animValue: Animated.SharedValue<number>;
	isRotate?: boolean;
}> = (props) => {
	const { animValue, index, length, isRotate } = props;
	const isDark = useIsDarkMode();
	const color = isDark ? colors.gray[100] : colors.gray[900];
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
				backgroundColor: isDark ? colors.gray[800] : colors.gray[200],
				width,
				height: width,
				borderRadius: 50,
				overflow: 'hidden',
				transform: [
					{
						rotateZ: isRotate ? '90deg' : '0deg',
					},
				],
			}}
		>
			<Animated.View
				style={[
					{
						borderRadius: 50,
						backgroundColor: color,
						flex: 1,
					},
					animStyle,
				]}
			/>
		</View>
	);
};

export const nextScreen = 'home';

const { useParam } = createParam<{ is_onboarding?: string }>();

export default function HowItWorks({}) {
	const slides = [Slide1, Slide2, Slide3, Slide4];
	const images = [
		'how-it-works/step1.webp',
		'how-it-works/step2.webp',
		'how-it-works/step3.webp',
		'how-it-works/step4.webp',
	];
	const [isOnboarding] = useParam('is_onboarding');
	const { t } = useTranslation();
	const redirectTo = useNavigateToScreen(true);

	const scrollOffsetValue = useSharedValue<number>(0);
	const progressValue = useSharedValue<number>(0);
	const animationStyle = useCallback((value: number) => {
		'worklet';

		const zIndex = interpolate(value, [-1, 0, 1], [10, 20, 30]);
		const opacity = interpolate(value, [-0.75, 0, 1], [0, 1, 0]);

		return {
			zIndex,
			opacity,
		};
	}, []);
	const nextButtonPressed = useCallback(() => {
		redirectTo(nextScreen);
	}, [redirectTo]);

	return (
		<OnboardingScreen
			title={t('How it works?')}
			isForm={false}
			canGoBack={!isOnboarding}
		>
			<View tw="grow shrink h-full max-h-screen">
				<Carousel
					loop
					autoPlay
					autoPlayInterval={8000}
					defaultScrollOffsetValue={scrollOffsetValue}
					onProgressChange={(_, absoluteProgress) => {
						progressValue.value = absoluteProgress;
					}}
					width={Dimensions.get('window').width}
					height={190}
					data={slides}
					renderItem={({ index, item: SlideComponent }) => (
						<SlideComponent key={index} />
					)}
					customAnimation={animationStyle}
				/>
				{!!progressValue && (
					<View tw="flex-row justify-between w-20 self-center">
						{slides.map((slide, index) => (
							<PaginationItem
								animValue={progressValue}
								index={index}
								key={index}
								isRotate={false}
								length={slides.length}
							/>
						))}
					</View>
				)}
				<View tw="flex-1">
					<Carousel
						defaultScrollOffsetValue={scrollOffsetValue}
						width={Dimensions.get('window').width}
						height={600}
						data={images}
						renderItem={({ item: imageSrc }) => (
							<Image
								resizeMode="contain"
								style={{
									alignSelf: 'center',
									marginHorizontal: '5%',
									width: Math.min(
										Dimensions.get('window').width * 0.8,
										410
									),
									height: '100%',
								}}
								source={{
									uri: getStaticImage(imageSrc),
								}}
								alt={t('How it works?')}
							/>
						)}
						customAnimation={animationStyle}
					/>
				</View>
			</View>
			{isOnboarding && (
				<View tw="absolute bottom-8 left-0 right-0 mx-4">
					<Button
						tw="m-1"
						variant="primary"
						size="regular"
						onPress={nextButtonPressed}
					>
						{t('Skip Introduction')}
					</Button>
				</View>
			)}
		</OnboardingScreen>
	);
}
