import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import { View } from '@diversifiedfinance/design-system/view';

import { createStackNavigator } from '@diversifiedfinance/app/navigation/lib/create-stack-navigator';
import { screenOptions } from '@diversifiedfinance/app/navigation/lib/navigator-screen-options';
import { MarketStackParams } from '@diversifiedfinance/app/navigation/navigators/types';
import { MarketScreen } from '@diversifiedfinance/app/screens/market';
import { useTranslation } from 'react-i18next';

const MarketStack = createStackNavigator<MarketStackParams>();

const HeaderLeft = () => {
	return <View />;
};

function MarketNavigator() {
	const { t } = useTranslation();
	const { top: safeAreaTop } = useSafeAreaInsets();
	const isDark = useIsDarkMode();

	return (
		<MarketStack.Navigator
			// @ts-ignore
			screenOptions={screenOptions({
				safeAreaTop,
				isDark,
				headerCenter: t('Market'),
				headerLeft: HeaderLeft,
			})}
			// screenOptions={{
			//   headerTitleStyle: {  },
			// }}
		>
			<MarketStack.Screen name="Market" component={MarketScreen} />
		</MarketStack.Navigator>
	);
}

export default MarketNavigator;
