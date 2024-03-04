import { BottomTabbar } from '../components/bottom-tab-bar';
import {
	HomeTabBarIcon,
	MarketTabBarIcon,
	NotificationsTabBarIcon,
	PortfolioTabBarIcon,
	SettingsTabBarIcon,
} from '../components/tab-bar-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeNavigator from '@diversifiedfinance/app/pages/home';
import PortfolioNavigator from '@diversifiedfinance/app/pages/portfolio';
import SettingsNavigator from '@diversifiedfinance/app/pages/settings';
import NotificationsNavigator from '@diversifiedfinance/app/pages/notifications';
import MarketNavigator from '@diversifiedfinance/app/pages/market';
import { usePreference } from '@diversifiedfinance/app/hooks/use-preference';

const BottomTab = createBottomTabNavigator();

export function BottomTabNavigator() {
	const [experimentalEnabled] = usePreference('experimental-features');
	return (
		<BottomTab.Navigator
			initialRouteName="homeTab"
			screenOptions={{
				headerShown: false,
			}}
			tabBar={(props) => <BottomTabbar {...props} />}
		>
			<BottomTab.Screen
				component={HomeNavigator}
				name="homeTab"
				options={{
					tabBarIcon: HomeTabBarIcon,
				}}
			/>
			<BottomTab.Screen
				component={PortfolioNavigator}
				name="portfolioTab"
				options={{
					tabBarIcon: PortfolioTabBarIcon,
				}}
			/>
			{experimentalEnabled && (
				<BottomTab.Screen
					component={MarketNavigator}
					name="marketTab"
					options={{
						tabBarIcon: MarketTabBarIcon,
					}}
				/>
			)}
			<BottomTab.Screen
				component={NotificationsNavigator}
				name="notificationsTab"
				options={{
					tabBarIcon: NotificationsTabBarIcon,
				}}
			/>
			<BottomTab.Screen
				component={SettingsNavigator}
				name="settingsTab"
				options={{
					tabBarIcon: SettingsTabBarIcon,
				}}
			/>
		</BottomTab.Navigator>
	);
}
