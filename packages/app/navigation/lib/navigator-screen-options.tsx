import { HeaderLeft } from '@diversifiedfinance/app/components/header';
import { Platform } from 'react-native';

export const screenOptions = ({
	safeAreaTop,
	isDark,
	headerLeft = null,
	headerRight = null,
	headerCenter = '',
}: {
	safeAreaTop: number;
	isDark: boolean;
	headerLeft?: any;
	headerRight?: any;
	headerCenter?: any;
}) =>
	({
		animationEnabled: true,
		headerShown: true,
		// obscureBackground: false,
		// detachPreviousScreen: false,
		headerLeft: headerLeft ?? HeaderLeft,
		headerTitle: headerCenter,
		headerTitleStyle: { fontSize: 16, fontWeight: '700' },
		headerTitleAlign: 'center' as 'center',
		headerRight: headerRight ?? null,
		headerTintColor: isDark ? '#fff' : '#000', // back button and title color
		headerTransparent: false,
		headerBackVisible: false,
		headerBackTitleVisible: false,
		headerShadowVisible: false,
		fullscreenGestureEnabled: true,
		animation: Platform.OS === 'android' ? 'none' : 'simple_push',
		animationDuration: Platform.OS === 'ios' ? 400 : undefined,
		statusBarStyle: isDark ? 'light' : 'dark',
		statusBarAnimation: 'fade',
		// @ts-ignore
		headerStyle: {
			height: 64 + safeAreaTop,
			// Similar to `headerShadowVisible` but for web
			// @ts-ignore
			borderBottomWidth: 0,
			backgroundColor: isDark ? 'black' : 'white',
		},
		cardStyle: { flex: 1, backgroundColor: 'transparent' },
		cardOverlayEnabled: false,
	} as {});
