import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';

import { usePlatformBottomHeight } from '@diversifiedfinance/app/hooks/use-platform-bottom-height';

import {
	Route,
	TabBarVertical,
} from '@diversifiedfinance/design-system/tab-view';

import { SettingTabsScene } from './tabs';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useTranslation } from 'react-i18next';

//const LEFT_SLIDE_WIDTH = 264;
export const SettingsMd = ({
	currentRouteIndex = 0,
	routes,
}: {
	currentRouteIndex: number;
	routes: Route[];
}) => {
	const { t } = useTranslation();
	const router = useRouter();
	const bottomHeight = usePlatformBottomHeight();

	return (
		<View tw="h-screen w-full flex-1 bg-white dark:bg-black">
			<View tw="h-screen w-full flex-row">
				<View tw="w-72 border-l border-r border-gray-200 dark:border-gray-800">
					<View tw="bg-white pt-8 dark:bg-black">
						<Text tw="px-4 text-xl font-bold text-gray-900 dark:text-white">
							{t('Settings')}
						</Text>
						<TabBarVertical
							onPress={(i) => {
								if (routes[i].onPress) {
									routes[i].onPress();
								} else if (routes[i].href) {
									router.push(routes[i].href, undefined, {
										shallow: true,
									});
								}
							}}
							routes={routes}
							index={currentRouteIndex}
							tw="px-2"
						/>
					</View>
				</View>

				<View tw="w-full flex-1 overflow-hidden overflow-y-auto bg-white dark:bg-black">
					<View>
						<SettingTabsScene route={routes[currentRouteIndex]} />
					</View>
				</View>
			</View>

			<View style={{ height: bottomHeight }} />
		</View>
	);
};
