import { styled } from '@diversifiedfinance/design-system/tailwind';
import type { TW } from '@diversifiedfinance/design-system/tailwind';
import { useMemo } from 'react';
import {
	Pressable as ReactNativePressable,
	PressableProps,
} from 'react-native';
import { ClientSideOnly } from '@diversifiedfinance/design-system/client-side-only';

export type Props = Omit<PressableProps, 'tw'> & {
	tw?: TW;
};

const StyledPressable = styled(ReactNativePressable);

export function PressableHover({ tw, ...props }: Props) {
	const twWithHover = useMemo(
		() =>
			[
				'hover:opacity-80 dark:hover:opacity-90',
				Array.isArray(tw) ? tw.join(' ') : tw,
			].join(' '),
		[tw]
	);

	return (
		<ClientSideOnly>
			<StyledPressable {...props} tw={twWithHover} />
		</ClientSideOnly>
	);
}
