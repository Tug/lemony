import Avatar from '../avatar';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import ArrowLeft from '@diversifiedfinance/design-system/icon/ArrowLeft';
import { PressableScale } from '@diversifiedfinance/design-system/pressable-scale';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import {
	useNavigation,
	useNavigationState,
} from '../../lib/react-navigation/native';
import { LogoHeaderWidget } from '@diversifiedfinance/app/components/header/widgets/logo';
import { Platform } from 'react-native';

type HeaderLeftProps = {
	canGoBack: boolean;
	withBackground?: boolean;
	color?: string;
	onBackPress?: () => void;
};

const SETTINGS_IN_BOTTOM_TAB = true;

export const HeaderLeft = ({
	canGoBack,
	withBackground = false,
	color,
	onBackPress,
}: HeaderLeftProps) => {
	const router = useRouter();
	const isDark = useIsDarkMode();
	const navigation = useNavigation();
	const { isAuthenticated } = useUser();
	const isHome = router.pathname === '/';
	// TODO: improve logic for isOnboarding
	const routeName = useNavigationState(({ routes, index }) => {
		return routes[index]?.name;
	});
	const showSettings =
		routeName === 'home' ||
		routeName === 'portfolio' ||
		(routeName === 'settings' && SETTINGS_IN_BOTTOM_TAB);
	const iconColor =
		// eslint-disable-next-line no-nested-ternary
		color ?? (withBackground ? '#FFF' : isDark ? '#FFF' : '#000');

	if (isHome || Platform.OS === 'web') {
		return <LogoHeaderWidget />;
	}

	if (!canGoBack) {
		return null;
	}

	if (showSettings && SETTINGS_IN_BOTTOM_TAB) {
		return <></>;
	}

	return (
		<PressableScale
			hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
			style={[
				{
					height: 32,
					width: 32,
					justifyContent: 'center',
					alignItems: 'center',
					borderRadius: 999,
				},
				withBackground && { backgroundColor: 'rgba(0,0,0,.6)' },
			]}
			onPress={() => {
				const canActuallyGoBack = canGoBack && navigation.canGoBack?.();
				if (onBackPress) {
					onBackPress();
				} else if (canActuallyGoBack) {
					router.pop();
				} else if (isAuthenticated) {
					// if (showSettings) {
					// 	router.push('/settings');
					// 	return;
					// }
					// navigateToHome();
				}
			}}
		>
			{showSettings ? (
				<Avatar size={24} iconColor={iconColor} />
			) : (
				<ArrowLeft color={iconColor} width={24} height={24} />
			)}
		</PressableScale>
	);
};
