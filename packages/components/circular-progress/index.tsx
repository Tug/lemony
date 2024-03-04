import { View } from '@diversifiedfinance/design-system';
import { ReactNode, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
	useAnimatedProps,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type CircularProgressProps = {
	size: number;
	strokeWidth: number;
	progress: number;
	showOverlay?: boolean;
	strokeColor?: string;
	strokeBgColor?: string;
	bgColor?: string;
	children?: ReactNode;
	reverse?: boolean;
	strokeLinecap: 'butt' | 'round' | 'square';
	rotate?: string;
};

export const CircularProgress = ({
	size,
	strokeWidth,
	progress: initialProgress,
	strokeColor = 'rgba(255, 255, 255, 0.2)',
	strokeBgColor = 'white',
	bgColor = 'transparent',
	children,
	reverse = false,
	strokeLinecap = 'butt',
	rotate = undefined,
}: CircularProgressProps) => {
	const r = (size - strokeWidth) / 2;
	const cx = size / 2;
	const cy = size / 2;
	const circumference = r * 2 * Math.PI;
	const progress = useSharedValue(initialProgress);
	const animatedProps = useAnimatedProps(
		() => ({
			strokeDashoffset: withSpring(
				circumference *
					(reverse ? 1 + progress.value : 1 - progress.value)
			),
		}),
		[progress]
	);

	useEffect(() => {
		progress.value = initialProgress;
	}, [initialProgress]);

	return (
		<>
			<Svg
				width={size}
				height={size}
				style={[
					styles.container,
					rotate ? { transform: [{ rotate }] } : {},
				]}
				viewBox={`0 0 ${size} ${size}`}
				fill="transparent"
			>
				<Circle
					cx={cx}
					cy={cy}
					r={r}
					stroke={strokeBgColor}
					strokeWidth={strokeWidth}
					fill={bgColor}
				/>
				<AnimatedCircle
					cx={cx}
					cy={cy}
					r={r}
					stroke={strokeColor}
					strokeWidth={strokeWidth}
					strokeDasharray={`${circumference}, ${circumference}`}
					strokeLinecap={strokeLinecap}
					animatedProps={animatedProps}
				/>
			</Svg>
			<View
				tw="absolute items-center justify-center"
				style={{ width: size, height: size }}
			>
				{children}
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		transform: [{ rotateZ: '270deg' }],
	},
});
