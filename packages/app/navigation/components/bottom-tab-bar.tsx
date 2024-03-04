import { useNavigationElements } from '../lib/use-navigation-elements';
import { useBottomTabBarHeightCallback } from '@diversifiedfinance/app/lib/react-navigation/bottom-tabs';
import { MotiView } from 'moti';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { Pressable } from '@diversifiedfinance/design-system/pressable';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { View } from '@diversifiedfinance/design-system/view';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useWindowDimensions } from 'react-native';
import { BOTTOM_TABBAR_BASE_HEIGHT } from '../../lib/constants';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import { Analytics } from '@diversifiedfinance/app/lib/analytics';

type ThemeBottomTabBarProps = BottomTabBarProps & {
	dark?: boolean;
};
export const ThemeBottomTabbar = ({
	navigation,
	state,
	descriptors,
	dark,
}: ThemeBottomTabBarProps) => {
	const { width } = useWindowDimensions();
	const isDarkMode = useIsDarkMode();
	const isDark = dark !== undefined ? dark : isDarkMode;

	const color = isDark ? colors.gray[100] : colors.gray[900];
	const activeColor = isDark ? colors.white : colors.themeBlack;

	return (
		<View tw="flex-row bg-transparent pt-2">
			{state.routes.map((route, index) => {
				const { options } = descriptors[route.key];
				const focused = state.index === index;

				const onPress = () => {
					Analytics.track(Analytics.events.BUTTON_CLICKED, {
						type: 'tabPress',
						target: route.key,
						name: route.name,
						params: route.params,
					});
					const event = navigation.emit({
						type: 'tabPress',
						target: route.key,
						canPreventDefault: true,
					});

					if (!focused && !event.defaultPrevented) {
						navigation.navigate({
							name: route.name,
							merge: true,
							params: route.params,
						});
					}
				};
				const onLongPress = () => {
					navigation.emit({
						type: 'tabLongPress',
						target: route.key,
					});
				};

				return (
					<View
						key={route.key}
						tw="flex flex-1 items-center justify-center"
					>
						<Pressable
							tw="flex-1"
							onLongPress={onLongPress}
							onPress={onPress}
						>
							{/*{options.tabBarButton && (*/}
							{/*	<CreateTabBarIcon*/}
							{/*		color={isDark ? '#000' : '#fff'}*/}
							{/*		style={{*/}
							{/*			backgroundColor: isDark*/}
							{/*				? '#fff'*/}
							{/*				: '#000',*/}
							{/*		}}*/}
							{/*	/>*/}
							{/*)}*/}
							{options.tabBarIcon?.({
								focused,
								color: focused ? activeColor : color,
								size: 24,
							})}
						</Pressable>
					</View>
				);
			})}

			<MotiView
				style={{
					position: 'absolute',
					top: 0,
					height: 2,
					backgroundColor: activeColor,
					width: width / state.routes.length,
				}}
				animate={{
					translateX: (width / state.routes.length) * state.index,
				}}
				transition={{ type: 'timing', duration: 250 }}
			/>
		</View>
	);
};

export const BottomTabbar = ({ state, ...rest }: BottomTabBarProps) => {
	const { isTabBarHidden } = useNavigationElements();
	const { bottom: safeAreaBottom } = useSafeAreaInsets();
	const nativeBottomTabBarHeightCallback = useBottomTabBarHeightCallback();
	const isHiddenBottomTabbar = isTabBarHidden;
	const isDarkMode = useIsDarkMode();
	return (
		<View
			style={{
				position: 'absolute',
				bottom: 0,
				width: '100%',
				height: isHiddenBottomTabbar
					? 0
					: BOTTOM_TABBAR_BASE_HEIGHT + safeAreaBottom,
				overflow: 'hidden',
				backgroundColor: isDarkMode ? 'black' : 'white',
			}}
			onLayout={({
				nativeEvent: {
					layout: { height },
				},
			}) => {
				nativeBottomTabBarHeightCallback(height);
			}}
		>
			<ThemeBottomTabbar state={state} {...rest} />
		</View>
	);
};
