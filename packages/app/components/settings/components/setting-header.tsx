import packageJson from '../../../package.json';
import { Hidden } from '@diversifiedfinance/design-system/hidden';
import {
	Route,
	TabBarSingle,
} from '@diversifiedfinance/design-system/tab-view';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

type SettingsHeaderProps = {
	index: number;
	setIndex: (index: number) => void;
	routers: Route[];
};
export const SettingsHeader = ({
	index,
	setIndex,
	routers,
}: SettingsHeaderProps) => {
	const { t } = useTranslation();
	const isWeb = Platform.OS === 'web';
	return (
		<>
			<View tw="dark:shadow-dark shadow-light items-center bg-white dark:bg-black md:mb-4">
				<View tw="w-full max-w-screen-2xl">
					<View tw="w-full flex-row justify-between self-center px-4 py-4 md:py-0">
						<Text tw="font-space-bold self-center text-2xl font-extrabold text-gray-900 dark:text-white">
							{t('Settings')}
						</Text>
						{!isWeb ? (
							<Text tw="font-space-bold text-2xl font-extrabold text-gray-100 dark:text-gray-900">
								v
								{Constants?.manifest?.version ??
									packageJson?.version}
							</Text>
						) : (
							<Hidden until="md">
								<TabBarSingle
									onPress={(i) => {
										setIndex(i);
									}}
									routes={routers}
									index={index}
								/>
							</Hidden>
						)}
					</View>
					{isWeb && (
						<Hidden from="md">
							<TabBarSingle
								onPress={(i) => {
									setIndex(i);
								}}
								routes={routers}
								index={index}
							/>
						</Hidden>
					)}
				</View>
			</View>
		</>
	);
};
