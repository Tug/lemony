import { memo } from 'react';

import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { Close } from '@diversifiedfinance/design-system/icon';
import {
	PressableScale,
	PressableScaleProps,
} from '@diversifiedfinance/design-system/pressable-scale';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { colors } from '@diversifiedfinance/design-system/tailwind';

type CloseButtonProps = PressableScaleProps & {
	color?: string;
	onPress?: () => void;
};
export const CloseButton = memo<CloseButtonProps>(function CloseButton({
	onPress,
	color,
	size = 24,
	...rest
}) {
	const router = useRouter();
	const isDark = useIsDarkMode();
	return (
		<PressableScale
			onPress={() => {
				if (onPress) {
					onPress();
				} else {
					router.pop();
				}
			}}
			hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
			{...rest}
		>
			<Close
				color={
					color ? color : isDark ? colors.gray[400] : colors.gray[600]
				}
				width={size}
				height={size}
			/>
		</PressableScale>
	);
});
