import { HeaderLeft } from './header-left';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import { View } from '@diversifiedfinance/design-system/view';
import React, { memo } from 'react';
import Animated, {
	useAnimatedStyle,
	interpolate,
} from 'react-native-reanimated';

export const DEFAULT_HEADER_HEIGHT = 44;

const renderComponent = (Component: any) => {
	if (!Component) return null;
	if (React.isValidElement(Component)) return Component;
	return <Component />;
};
export type HeaderProps = {
	headerLeft?: React.ComponentType<any> | React.ReactElement | null;
	headerCenter?: React.ComponentType<any> | React.ReactElement | null;
	headerRight?: React.ComponentType<any> | React.ReactElement | null;
	translateYValue?: Animated.SharedValue<number>;
	disableCenterAnimation?: boolean;
	canGoBack?: boolean;
	tw?: string;
	withBackground?: boolean;
	color?: string;
};

export const Header = memo<HeaderProps>(function Header({
	headerLeft,
	headerCenter,
	headerRight,
	translateYValue,
	disableCenterAnimation = false,
	tw = '',
	canGoBack,
	withBackground = false,
	color,
}) {
	const { top } = useSafeAreaInsets();
	const router = useRouter();
	const isRootScreen = router.asPath === '/';
	const headerHeight = top + DEFAULT_HEADER_HEIGHT;
	const animationCenterStyles = useAnimatedStyle(() => {
		if (!translateYValue || disableCenterAnimation) return {};

		return {
			opacity: interpolate(
				-translateYValue.value,
				[top, headerHeight],
				[0, 1]
			),
		};
	}, [translateYValue]);
	return (
		<View
			tw={['absolute top-0 z-10 w-full items-center overflow-hidden', tw]}
			style={[
				{
					paddingTop: top,
					height: headerHeight,
				},
			]}
		>
			<View tw="h-full w-full flex-row flex-nowrap px-4">
				<View tw="max-w-[48px] flex-1 items-start justify-center mr-auto">
					<View tw="mr-auto">
						{headerLeft ? (
							renderComponent(headerLeft)
						) : (
							<HeaderLeft
								canGoBack={canGoBack ?? isRootScreen}
								withBackground={withBackground}
								color={color}
							/>
						)}
					</View>
				</View>

				<Animated.View
					style={[
						{
							flex: 1,
							flexGrow: 1,
							alignItems: 'center',
							justifyContent: 'center',
						},
						animationCenterStyles,
					]}
				>
					{renderComponent(headerCenter)}
				</Animated.View>

				<View tw="min-w-[48px] justify-center">
					<View tw="ml-auto">{renderComponent(headerRight)}</View>
				</View>
			</View>
		</View>
	);
});
export const SearchInHeader = () => null;
