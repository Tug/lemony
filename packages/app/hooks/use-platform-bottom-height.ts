import {
	BOTTOM_TABBAR_BASE_HEIGHT,
	HIDE_MOBILE_WEB_FOOTER_SCREENS,
} from '@diversifiedfinance/app/lib/constants';
import { MOBILE_WEB_TABS_HEIGHT } from '@diversifiedfinance/app/constants/layout';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import { breakpoints } from '@diversifiedfinance/design-system/theme';
import { Platform, useWindowDimensions } from 'react-native';
import { useNavigationElements } from '@diversifiedfinance/app/navigation/lib/use-navigation-elements';

export const usePlatformBottomHeight = () => {
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const { bottom: safeAreaBottom } = useSafeAreaInsets();
	const { isTabBarHidden } = useNavigationElements();
	const router = useRouter();
	if (isTabBarHidden) {
		return 0;
	}
	if (Platform.OS === 'web') {
		const mobileWebBottomHeight = HIDE_MOBILE_WEB_FOOTER_SCREENS.includes(
			router.pathname
		)
			? 0
			: insets.bottom + MOBILE_WEB_TABS_HEIGHT;
		const isMdWidth = width >= breakpoints.md;
		const webBottomTabBarHeight = isMdWidth
			? insets.bottom
			: mobileWebBottomHeight;
		return webBottomTabBarHeight;
	}
	if (router.pathname !== '/') {
		return 0;
	}
	return safeAreaBottom + BOTTOM_TABBAR_BASE_HEIGHT;
};
