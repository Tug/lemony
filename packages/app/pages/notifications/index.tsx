import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import { View } from '@diversifiedfinance/design-system/view';

import { NotificationsSettingIcon } from '@diversifiedfinance/app/components/header/notifications-setting-icon';
import { createStackNavigator } from '@diversifiedfinance/app/navigation/lib/create-stack-navigator';
import { screenOptions } from '@diversifiedfinance/app/navigation/lib/navigator-screen-options';
import { NotificationsStackParams } from '@diversifiedfinance/app/navigation/navigators/types';
import { NotificationsScreen } from '@diversifiedfinance/app/screens/notifications';
import { useTranslation } from 'react-i18next';

const NotificationsStack = createStackNavigator<NotificationsStackParams>();

const HeaderLeft = () => {
	return <View />;
};

function NotificationsNavigator() {
	const { t } = useTranslation();
	const { top: safeAreaTop } = useSafeAreaInsets();
	const isDark = useIsDarkMode();

	return (
		<NotificationsStack.Navigator
			// @ts-ignore
			screenOptions={screenOptions({
				safeAreaTop,
				isDark,
				headerCenter: t('Notifications'),
				headerLeft: HeaderLeft,
				headerRight: NotificationsSettingIcon,
			})}
			// screenOptions={{
			//   headerTitleStyle: {  },
			// }}
		>
			<NotificationsStack.Screen
				name="notifications"
				component={NotificationsScreen}
			/>
		</NotificationsStack.Navigator>
	);
}

export default NotificationsNavigator;
