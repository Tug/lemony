import { View } from '@diversifiedfinance/design-system/view';
import React, { ReactNode, useEffect } from 'react';
import { Platform, RefreshControl } from 'react-native';
import { ScrollView } from '@diversifiedfinance/design-system';
import { colors, TW } from '@diversifiedfinance/design-system/tailwind';
import { usePlatformBottomHeight } from '@diversifiedfinance/app/hooks/use-platform-bottom-height';
import Animated, {
	useAnimatedStyle,
	withSpring,
} from 'react-native-reanimated';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

export interface ScreenProps {
	tw?: string | Array<string> | TW[];
	top?: ReactNode;
	children: ReactNode;
	isRefreshing?: boolean;
	withBackground?: boolean;
	onRefresh?: () => void;
	backgroundHeaderHeight?: Animated.SharedValue<number>;
}

export const Screen = ({
	tw,
	children,
	isRefreshing = false,
	withBackground = false,
	onRefresh,
	backgroundHeaderHeight,
}: ScreenProps) => {
	const isDark = useIsDarkMode();
	const bottomBarHeight = usePlatformBottomHeight();
	const defaultBackgroundHeight = 250;
	const animationBackgroundStyles = useAnimatedStyle(() => {
		if (!backgroundHeaderHeight) {
			return {
				top: -500,
				height: 500 + defaultBackgroundHeight,
			};
		}

		return {
			top: -500,
			height: withSpring(500 + backgroundHeaderHeight.value),
		};
	}, [backgroundHeaderHeight]);

	return (
		<View
			tw={[
				'w-full flex-1 items-center bg-blueGray-100 dark:bg-black',
				...(Array.isArray(tw) ? tw : [tw ?? '']),
			]}
			style={{
				marginBottom: Platform.select({
					native: bottomBarHeight,
				}),
			}}
		>
			<View tw="md:max-w-screen-content w-full">
				<ScrollView
					{...(onRefresh && {
						refreshControl: (
							<RefreshControl
								refreshing={isRefreshing}
								onRefresh={onRefresh}
							/>
						),
					})}
				>
					<View
						tw={['mb-6 w-full', Platform.select({ web: 'mt-12' })]}
					>
						{withBackground && Platform.OS !== 'web' && (
							<>
								<Animated.View
									style={[
										{
											position: 'absolute',
											right: 0,
											left: 0,
											backgroundColor: isDark
												? colors.black
												: colors.diversifiedBlue,
											overflow: 'visible',
										},
										animationBackgroundStyles,
									]}
								>
									<View tw="absolute w-full h-24 items-center -bottom-12">
										<View
											tw="w-1/4 h-24 rounded-full bg-diversifiedBlue dark:bg-black"
											style={{
												transform: [{ scaleX: 4 }],
											}}
										></View>
									</View>
								</Animated.View>
							</>
						)}

						<View tw="mx-4">{children}</View>
					</View>
				</ScrollView>
			</View>
		</View>
	);
};

export default Screen;
