import { View } from '@diversifiedfinance/design-system/view';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { IntercomHeaderWidget } from '@diversifiedfinance/app/components/header/widgets/intercom';

type HeaderRightProps = {
	withBackground?: boolean;
};

export const HeaderRight = ({ withBackground }: HeaderRightProps) => {
	const router = useRouter();
	const isHome = router.pathname === '/';

	if (isHome) {
		// return <XPBadgeHeaderWidget />;
		return <IntercomHeaderWidget />;
	}

	return <View></View>;
};
