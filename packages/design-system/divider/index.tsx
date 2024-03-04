import type { TW } from '@diversifiedfinance/design-system/tailwind';
import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import { StyleSheet, ViewProps, StyleProp, ViewStyle } from 'react-native';

export interface DividerProps extends ViewProps {
	/**  Applies style to the divider. */
	style?: StyleProp<ViewStyle>;

	/**  Tailwind style to the divider. */
	tw?: TW;

	/**  Apply orientation to the divider. */
	orientation?: 'horizontal' | 'vertical';

	/**  divider horizontal width to the divider, not support vertical mode  */
	width?: number;

	/**  divider vertical height to the divider, not support horizontal mode */
	height?: number;
}

export const Divider: React.FC<DividerProps> = ({
	orientation = 'horizontal',
	style,
	tw,
	width = '100%',
	height = 'auto',
	...rest
}) => (
	<View
		style={[
			orientation === 'horizontal'
				? { width, height: StyleSheet.hairlineWidth }
				: { width: 1, height },
			style,
		]}
		tw={[
			'bg-gray-200 dark:bg-gray-800',
			Array.isArray(tw) ? tw.join(' ') : tw ?? '',
		]}
		{...rest}
	/>
);

Divider.displayName = 'Divider';
