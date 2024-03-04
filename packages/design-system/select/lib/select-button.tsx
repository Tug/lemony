import React, { forwardRef, useMemo } from 'react';
import { Pressable } from 'react-native';

import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import {
	useIsDarkMode,
	useOnHover,
	useOnPress,
} from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { Text } from '@diversifiedfinance/design-system/text';

import { SelectProps } from '../types';
import { ChevronDownIcon } from './chevron-down-icon';

interface SelectButtonProps extends Pick<SelectProps<any>, 'size'> {
	open: boolean;
	label: string;
	disabled?: boolean;
	onClick?: () => void;
	onPress?: () => void;
	isPlaceholder?: boolean;
}

const BACKGROUND_MAPPER = {
	default: [colors.gray[900], colors.gray[100]],
	hover: [colors.gray[800], colors.gray[200]],
	pressed: [colors.gray[700], colors.gray[300]],
};

export const SelectButton: React.FC<SelectButtonProps> = forwardRef(
	(
		{
			label,
			open,
			disabled,
			size,
			onPress,
			onClick,
			isPlaceholder,
			...rest
		},
		ref
	) => {
		//#region hooks
		const isDarkMode = useIsDarkMode();
		const { onHoverIn, onHoverOut, hovered } = useOnHover();
		const { onPressIn, onPressOut, pressed } = useOnPress();
		//#endregion

		//#region styles
		const containerAnimatedStyle = useAnimatedStyle(
			() => ({
				opacity: disabled ? 0.4 : 1,
				backgroundColor: pressed.value
					? BACKGROUND_MAPPER.pressed[isDarkMode ? 0 : 1]
					: hovered.value
					? BACKGROUND_MAPPER.hover[isDarkMode ? 0 : 1]
					: BACKGROUND_MAPPER.default[isDarkMode ? 0 : 1],
			}),
			[isDarkMode, hovered, pressed, disabled]
		);

		// h-12 bg-gray-100 p-4 dark:bg-gray-900
		const containerStyle = useMemo(
			() => [
				{
					height: size === 'regular' ? 48 : 32,
					paddingHorizontal: 16,
					borderRadius: 9999,
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
				},
				containerAnimatedStyle,
			],
			[containerAnimatedStyle, size, isDarkMode]
		);
		//#endregion

		return (
			<Pressable
				//@ts-ignore
				ref={ref}
				//@ts-ignore - web only prop
				onHoverIn={onHoverIn}
				onHoverOut={onHoverOut}
				onPress={onPress || onClick}
				onPressIn={onPressIn}
				onPressOut={onPressOut}
				disabled={disabled}
				{...rest}
			>
				<Animated.View
					// @ts-ignore
					style={containerStyle}
				>
					<Text
						tw={[
							'mr-2',
							isPlaceholder
								? 'text-gray-600 dark:text-gray-400'
								: 'text-gray-900 dark:text-white',
							size === 'regular' ? 'text-base' : 'text-xs',
						]}
					>
						{label}
					</Text>
					<ChevronDownIcon
						height={16}
						width={16}
						open={open}
						aria-hidden="true"
					/>
				</Animated.View>
			</Pressable>
		);
	}
);

SelectButton.displayName = 'SelectButton';
