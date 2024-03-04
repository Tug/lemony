import { Link } from '../../navigation/link';
import Diversified from '@diversifiedfinance/design-system/icon/Diversified';
import { View } from '@diversifiedfinance/design-system/view';
import { colors } from '@diversifiedfinance/design-system/tailwind';

export const HeaderCenter = ({ isDark }: { isDark?: boolean }) => {
	return (
		<View tw="flex flex-row">
			<Link href="/">
				<Diversified
					width={24}
					height={24}
					color={isDark ? colors.white : colors.diversifiedBlue}
				/>
			</Link>
			{/*{isMdWidth ? <SearchInHeader /> : null}*/}
		</View>
	);
};
