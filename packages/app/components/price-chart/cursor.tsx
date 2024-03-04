import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
	useAnimatedGestureHandler,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { getYForX, Vector } from '@diversifiedfinance/react-native-redash';
import { Graphs } from './types';

interface CursorProps {
	index: number;
	isActive: Animated.SharedValue<boolean>;
	translation: Vector<Animated.SharedValue<number>>;
	graphs: Graphs;
	width: number;
}

export const Cursor: React.FC<CursorProps> = ({
	translation,
	isActive,
	index,
	graphs,
	width,
	color = 'black',
	bgColor = 'rgba(0, 0, 0, 0.1)',
}) => {
	const pan = Gesture.Pan()
		.activeOffsetX([-10, 10])
		.onBegin((event) => {
			isActive.value = true;
			translation.x.value = Math.min(Math.max(event.x, 0.1), width);
			translation.y.value = getYForX(
				graphs[index].data.path,
				translation.x.value
			);
		})
		.onChange((event) => {
			translation.x.value = Math.min(Math.max(event.x, 0.1), width);
			translation.y.value = getYForX(
				graphs[index].data.path,
				translation.x.value
			);
		})
		.onFinalize(() => {
			isActive.value = false;
		});

	const style = useAnimatedStyle(() => {
		const translateX = translation.x.value - CURSOR_SIZE / 2;
		const translateY = translation.y.value - CURSOR_SIZE / 2;
		return {
			transform: [
				{ translateX },
				{ translateY },
				{ scale: withSpring(isActive.value ? 1 : 0) },
			],
		};
	}, [translation, isActive]);

	return (
		<GestureHandlerRootView style={StyleSheet.absoluteFill}>
			<GestureDetector gesture={pan}>
				<Animated.View
					collapsable={false}
					style={StyleSheet.absoluteFill}
				>
					<Animated.View
						style={[
							styles.cursor,
							{ backgroundColor: bgColor },
							style,
						]}
					>
						<View
							style={[
								styles.cursorBody,
								{ backgroundColor: color },
							]}
						/>
					</Animated.View>
				</Animated.View>
			</GestureDetector>
		</GestureHandlerRootView>
	);
};
export const CURSOR_SIZE = 50;

export const styles = StyleSheet.create({
	cursor: {
		alignItems: 'center',
		borderRadius: CURSOR_SIZE / 2,
		height: CURSOR_SIZE,
		justifyContent: 'center',
		width: CURSOR_SIZE,
	},
	cursorBody: {
		borderRadius: 7.5,
		height: 15,
		width: 15,
	},
});
