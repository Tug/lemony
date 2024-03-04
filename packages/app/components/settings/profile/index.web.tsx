import { useTabState } from '../../../hooks/use-tab-state';
import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import SettingsHeader from '@diversifiedfinance/app/components/settings/header';
import { usePlatformBottomHeight } from '@diversifiedfinance/app/hooks/use-platform-bottom-height';
import { useProfileSettingsRoutes } from './routes';
import { useWindowDimensions } from 'react-native';
import { breakpoints } from '@diversifiedfinance/design-system/theme';
import { SettingsMd } from './index.md';
import { SettingTabsScene } from './tabs';

export function ProfileSettings(): React.ReactElement {
	const profileSettingsRoutes = useProfileSettingsRoutes();
	const { index, setIndex, routes } = useTabState(profileSettingsRoutes);
	const bottomHeight = usePlatformBottomHeight();
	const { width } = useWindowDimensions();
	const isLgWidth = width >= breakpoints.lg;

	return isLgWidth ? (
		<SettingsMd />
	) : (
		<View tw="h-screen w-full border-l-0 border-gray-200 bg-white dark:border-gray-800 dark:bg-black md:border-l">
			<SettingsHeader index={index} setIndex={setIndex} routers={[]} />
			<SettingTabsScene route={routes[index]} />
			<View style={{ height: bottomHeight }} />
		</View>
	);
}

export default ProfileSettings;
