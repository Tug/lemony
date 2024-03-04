import { Pressable } from '@diversifiedfinance/design-system';
import { UserXPBadge } from '@diversifiedfinance/app/components/user-xp-badge';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { useVIPUserLevel } from '@diversifiedfinance/app/hooks/use-vip-user-level';
import { IntercomHeaderWidget } from '@diversifiedfinance/app/components/header/widgets/intercom';

export function XPBadgeHeaderWidget() {
	const redirectTo = useNavigateToScreen();
	const openVIPModal = () => {
		redirectTo('vipProgram');
	};

	const { isCustomer } = useVIPUserLevel();

	if (!isCustomer) {
		return <IntercomHeaderWidget />;
	}

	return (
		<Pressable variant="transparent" onPress={openVIPModal}>
			<UserXPBadge iconOnly />
		</Pressable>
	);
}
