import {
	NavigationContainer,
	LinkingOptions,
} from '@diversifiedfinance/app/lib/react-navigation/native';
import { linking } from '@diversifiedfinance/app/navigation/linking';
import { NavigationElementsProvider } from './lib/navigation-elements-context';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { useState, useRef, useMemo } from 'react';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

function useLinkingConfig(
	trackedLinking: React.MutableRefObject<
		LinkingOptions<ReactNavigation.RootParamList>
	>
) {
	return {
		linking: trackedLinking.current,
		onReady: useMemo(
			() =>
				Platform.select({
					web: () => {
						trackedLinking.current.enabled = false;
					},
					native: async () => {
						await SplashScreen.hideAsync();
					},
				}),
			[trackedLinking]
		),
	};
}

export function NavigationProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const trackedLinking = useRef(linking);
	const linkingConfig = useLinkingConfig(trackedLinking);
	const isDark = useIsDarkMode();
	const [isHeaderHidden, setIsHeaderHidden] = useState(false);
	const [isTabBarHidden, setIsTabBarHidden] = useState(false);

	return (
		<NavigationContainer
			linking={
				process.env.NODE_ENV !== 'test'
					? linkingConfig.linking
					: undefined
			}
			// fallback={<LockScreen hideLock />}
			onReady={linkingConfig.onReady}
			theme={{
				dark: isDark,
				colors: {
					primary: '#fff',
					background: isDark ? '#000' : '#fff',
					card: '#000',
					text: isDark ? '#fff' : '#000',
					border: 'rgb(39, 39, 41)',
					notification: colors.diversifiedBlue,
				},
			}}
			documentTitle={{
				enabled: true,
				formatter: (options) =>
					options?.title
						? `${options.title} | Diversified`
						: 'Diversified',
			}}
		>
			<NavigationElementsProvider
				value={{
					isHeaderHidden,
					setIsHeaderHidden,
					isTabBarHidden,
					setIsTabBarHidden,
				}}
			>
				{children}
			</NavigationElementsProvider>
		</NavigationContainer>
	);
}
