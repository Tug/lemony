import { memo, useState, useMemo } from 'react';

import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { ChevronRight, Link } from '@diversifiedfinance/design-system/icon';
import { Pressable } from '@diversifiedfinance/design-system/pressable';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';

import { Route } from '.';
import { Platform } from 'react-native';
import Edit from '@diversifiedfinance/design-system/icon/Edit';

type TabBarVerticalProps = {
	routes: Route[];
	index: number;
	onPress?: (index: number) => void;
	tw?: string;
};
const OFFSET = 16;

export const TabBarVertical = memo<TabBarVerticalProps>(
	function TabBarVertical({ routes, index: propIndex, onPress, tw = '' }) {
		const isDark = useIsDarkMode();
		const [tabsHeight, setTabsHeight] = useState<{
			[index: number]: number;
		}>({});

		const outputRange = useMemo(
			() =>
				routes.reduce<number[]>((acc, _, i) => {
					if (i === 0) return [OFFSET];
					return [...acc, acc[i - 1] + tabsHeight[i - 1]];
				}, []),
			[routes, tabsHeight]
		);

		return (
			<View tw={['mt-8', tw]}>
				{routes.map((item, index) => (
					<Pressable
						tw="flex-row items-center justify-between rounded-2xl px-3 py-5 transition-all hover:bg-gray-50 hover:dark:bg-gray-900"
						key={item.key}
						onPress={() => onPress?.(index)}
						onLayout={({
							nativeEvent: {
								layout: { height },
							},
						}) => {
							const tabs = Object.assign(tabsHeight, {
								[index]: height,
							});
							if (
								Object.keys(tabsHeight).length === routes.length
							) {
								setTabsHeight({ ...tabs });
							}
						}}
					>
						<Text
							tw={[
								'text-lg leading-6 text-black duration-300 dark:text-white',
								propIndex === index
									? 'font-bold'
									: 'font-medium',
							]}
						>
							{item.title}
						</Text>
						{!item.href &&
							item.onPress &&
							Platform.OS === 'web' && (
								<Link
									width={16}
									height={16}
									color={isDark ? colors.white : colors.black}
								/>
							)}
					</Pressable>
				))}
				<View
					tw="animate-fade-in absolute right-2 transition-all"
					style={{
						transform: [
							{
								translateY: outputRange[propIndex],
							},
						],
					}}
				>
					<ChevronRight
						width={24}
						height={24}
						color={isDark ? colors.white : colors.black}
					/>
				</View>
			</View>
		);
	}
);
