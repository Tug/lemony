import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { Settings } from '@diversifiedfinance/design-system/icon';
import { PressableScale } from '@diversifiedfinance/design-system/pressable-scale';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';

export const NotificationsSettingIcon = ({ size = 24 }) => {
	const redirectTo = useNavigateToScreen();
	const isDark = useIsDarkMode();

	return (
		<PressableScale
			onPress={() => redirectTo('notificationSettings')}
			tw="h-8 w-8 items-center justify-center rounded-full"
		>
			<Settings
				width={size}
				height={size}
				color={isDark ? '#FFF' : '#000'}
			/>
		</PressableScale>
	);
};
