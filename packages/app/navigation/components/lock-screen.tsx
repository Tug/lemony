import { View } from '@diversifiedfinance/design-system/view';
import { Lock } from '@diversifiedfinance/design-system/icon';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { Platform } from 'react-native';

const Overlay =
	Platform.OS === 'ios'
		? require('react-native-screens').FullWindowOverlay
		: View;

export function LockScreen({ hideLock }: { hideLock?: boolean }) {
	return (
		<Overlay>
			<View tw="bg-diversifiedBlue dark:bg-black h-full w-full items-center justify-center">
				{!hideLock && (
					<Lock color={colors.white} width="25%" height="25%" />
				)}
			</View>
		</Overlay>
	);
}
