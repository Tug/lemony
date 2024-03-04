import React, { useEffect } from 'react';
import { Platform } from 'react-native';

import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';

import { usePlatformBottomHeight } from '@diversifiedfinance/app/hooks/use-platform-bottom-height';
import { useTabState } from '@diversifiedfinance/app/hooks/use-tab-state';

import {
	Route,
	TabBarVertical,
} from '@diversifiedfinance/design-system/tab-view';

import { useTranslation } from 'react-i18next';
import { SettingTabsScene } from './tabs';
import { useProfileSettingsRoutes } from '@diversifiedfinance/app/components/settings/profile/routes';

//const LEFT_SLIDE_WIDTH = 264;
export const SettingsMd = ({}: {}) => {
	const { t } = useTranslation();
	const bottomHeight = usePlatformBottomHeight();
	const profileSettingsRoutes = useProfileSettingsRoutes();
	const { index, setIndex, routes } = useTabState(profileSettingsRoutes);

	useEffect(() => {
		if (Platform.OS === 'web') {
			window.scrollTo(0, 0);
		}
	}, [index]);

	return (
		<View tw="h-screen w-full flex-1 bg-white dark:bg-black">
			<View tw="h-screen w-full flex-row">
				<View tw="w-72 border-l border-r border-gray-200 dark:border-gray-800">
					<View tw="bg-white pt-8 dark:bg-black">
						<Text tw="px-4 text-xl font-bold text-gray-900 dark:text-white">
							{t('Profile')}
						</Text>
						<TabBarVertical
							onPress={(i) => {
								setIndex(i);
							}}
							routes={routes}
							index={index}
							tw="px-2"
						/>
					</View>
				</View>

				<View tw="w-full flex-1 overflow-hidden overflow-y-auto bg-white dark:bg-black">
					<View>
						<SettingTabsScene route={routes[index]} />
					</View>
				</View>
			</View>

			<View style={{ height: bottomHeight }} />
		</View>
	);
};
