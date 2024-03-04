import { View, Text } from '@diversifiedfinance/design-system';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
	interpolate,
	runOnJS,
	useAnimatedReaction,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
} from 'react-native-reanimated';
import {
	AnimatedText,
	round,
	Vector,
} from '@diversifiedfinance/react-native-redash';
import { Graphs } from './types';
import { useTranslation } from 'react-i18next';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';

interface HeaderProps {
	graphs: Graphs;
	isActive: Animated.SharedValue<boolean>;
	translation: Vector<Animated.SharedValue<number>>;
	index: number;
	width: number;
	height: number;
	precision: number;
}

export const Header: React.FC<HeaderProps> = ({
	graphs,
	width,
	height,
	isActive,
	translation,
	index = 0,
	precision = 0,
}) => {
	const isDark = useIsDarkMode();
	const textColor = isDark ? colors.white : colors.black;
	const { t, i18n } = useTranslation();
	const lang = i18n.language;
	const lastPriceLabel = t('Last price');

	const data = useDerivedValue(() => graphs[index]?.data, [graphs, index]);
	const label = useDerivedValue(() => data.value?.label, [data]);
	const percentChange = useDerivedValue(
		() => `${round(data.value?.percentChange, 2)}%`,
		[data]
	);

	const price = useDerivedValue(() => {
		'worklet';
		const p = !isActive.value
			? data.value?.lastPrice
			: interpolate(
					translation.y.value,
					[0, height],
					[data.value?.maxPrice, data.value?.minPrice]
			  );
		return `€ ${round(p, precision).toLocaleString(lang, {
			currency: 'EUR',
		})}`;
	}, [translation.y, data, isActive, lang, height, precision]);

	const dateStr = useDerivedValue(() => {
		'worklet';
		//'Last price'
		const timestamp = !isActive.value
			? null
			: interpolate(
					translation.x.value,
					[0, width],
					[data.value?.startDate, data.value?.endDate]
			  );
		return timestamp
			? new Date(timestamp).toLocaleDateString(lang)
			: lastPriceLabel;
	}, [translation.x, data, lastPriceLabel, lang, isActive, width]);

	const style = useAnimatedStyle(() => {
		const percentChange = data.value?.percentChange;
		const epsilon = 0.005;
		const color =
			Math.abs(percentChange) < epsilon
				? 'gray'
				: percentChange > 0
				? 'green'
				: 'red';
		return {
			color,
			fontSize: 18,
			fontWeight: '500',
		};
	}, [index]);

	return (
		<View tw="pb-4 px-4">
			<View style={styles.values}>
				<View>
					<AnimatedText
						text={price}
						style={[styles.value, { color: textColor }]}
					/>
					{/* <Text style={styles.value}>{state}</Text> */}
					<AnimatedText
						style={[styles.label, { color: textColor }]}
						text={dateStr}
					/>
				</View>
				<View>
					<AnimatedText style={[style]} text={percentChange} />
					<AnimatedText
						style={[styles.label, { color: textColor }]}
						text={label}
					/>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	label: {
		fontSize: 14,
	},
	value: {
		fontSize: 18,
		fontWeight: '500',
	},
	values: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 12,
	},
});
