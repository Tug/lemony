import { useWindowDimensions } from 'react-native';
import { breakpoints } from '@diversifiedfinance/design-system/theme';
import { withColorScheme } from '@diversifiedfinance/components/memo-with-theme';
import { HeaderMd } from './header.md.web';
import { HeaderSm } from './header.sm.web';

export const Header = withColorScheme(() => {
	const { width } = useWindowDimensions();
	const isMdWidth = width >= breakpoints.md;

	if (isMdWidth) {
		return <HeaderMd />;
	}

	return <HeaderSm />;
});
