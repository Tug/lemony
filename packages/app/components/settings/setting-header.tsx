import { Platform } from 'react-native';

import {
	Route,
	TabBarSingle,
} from '@diversifiedfinance/design-system/tab-view';
import { View } from '@diversifiedfinance/design-system/view';

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
	return (
		<>
			{Platform.OS === 'web' && (
				<View tw="items-center bg-white dark:bg-black">
					<View tw="w-full max-w-screen-2xl">
						<TabBarSingle
							onPress={(i) => {
								setIndex(i);
							}}
							routes={routers}
							index={index}
						/>
					</View>
				</View>
			)}
		</>
	);
};
