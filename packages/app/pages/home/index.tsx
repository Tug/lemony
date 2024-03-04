import {
	HeaderCenter,
	HeaderLeft,
	HeaderRight,
} from '@diversifiedfinance/app/components/header';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { createStackNavigator } from '@diversifiedfinance/app/navigation/lib/create-stack-navigator';
import { screenOptions } from '@diversifiedfinance/app/navigation/lib/navigator-screen-options';
import { HomeStackParams } from '@diversifiedfinance/app/navigation/navigators/types';
import { HomeScreen } from '@diversifiedfinance/app/screens/home';
import { Button } from '@diversifiedfinance/design-system/button';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

const HomeStack = createStackNavigator<HomeStackParams>();

const NativeHeaderRight = () => {
	const router = useRouter();
	const { isLoading, isAuthenticated } = useUser();

	if (isLoading) {
		return null;
	}

	if (isAuthenticated) {
		return <HeaderRight />;
	}

	return (
		<Button
			onPress={() => {
				// This component is native-only so we don't need to
				// worry about the web router.
				router.push('/login');
			}}
			variant="primary"
			size="small"
			labelTW="font-semibold"
		>
			Sign&nbsp;In
		</Button>
	);
};

function HomeNavigator() {
	const { top: safeAreaTop } = useSafeAreaInsets();
	const isDark = useIsDarkMode();

	return (
		<HomeStack.Navigator
			screenOptions={screenOptions({
				safeAreaTop,
				isDark,
				headerLeft: HeaderLeft,
				headerRight: NativeHeaderRight,
			})}
		>
			<HomeStack.Screen name="home" component={HomeScreen} />
		</HomeStack.Navigator>
	);
}

export default HomeNavigator;
