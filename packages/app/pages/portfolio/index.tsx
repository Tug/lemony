import { createStackNavigator } from '@diversifiedfinance/app/navigation/lib/create-stack-navigator';
import { screenOptions } from '@diversifiedfinance/app/navigation/lib/navigator-screen-options';
import { PortfolioStackParams } from '@diversifiedfinance/app/navigation/navigators/types';
import { PortfolioScreen } from '@diversifiedfinance/app/screens/portfolio';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { View } from '@diversifiedfinance/design-system';
import { useTranslation } from 'react-i18next';

const PortfolioStack = createStackNavigator<PortfolioStackParams>();

function PortfolioNavigator() {
	const { t } = useTranslation();
	const { top: safeAreaTop } = useSafeAreaInsets();
	const isDark = useIsDarkMode();

	return (
		<PortfolioStack.Navigator
			screenOptions={screenOptions({
				safeAreaTop,
				isDark,
				headerCenter: t('My Portfolio'),
				headerLeft: () => <View />,
			})}
		>
			<PortfolioStack.Screen
				name="portfolio"
				component={PortfolioScreen}
			/>
		</PortfolioStack.Navigator>
	);
}

export default PortfolioNavigator;
