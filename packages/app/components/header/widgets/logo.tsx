import { DiversifiedWordmark } from '@diversifiedfinance/design-system/icon';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { View } from '@diversifiedfinance/design-system';
import { Link } from '@diversifiedfinance/app/navigation/link';

export function LogoHeaderWidget() {
	const isDark = useIsDarkMode();
	return (
		<View tw="justify-center">
			<Link href="/">
				<DiversifiedWordmark
					width={108}
					height={21}
					color={isDark ? '#FFF' : '#000'}
				/>
			</Link>
		</View>
	);
}
