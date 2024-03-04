import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { breakpoints } from '@diversifiedfinance/design-system/theme';
import { useWindowDimensions } from 'react-native';

export const useSocialColor = () => {
	const isDark = useIsDarkMode();
	const { width } = useWindowDimensions();
	const isMdWidth = width >= breakpoints['md'];
	return {
		textColors: [
			colors.gray[900],
			isMdWidth ? colors.gray[400] : colors.white,
		],
		iconColor: isDark
			? isMdWidth
				? colors.gray[400]
				: colors.white
			: colors.gray[900],
	};
};
