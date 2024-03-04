import {
	LinkCore,
	Props,
} from '@diversifiedfinance/app/navigation/link/link-core';
import { Pressable } from '@diversifiedfinance/design-system/pressable';
import type { TW } from '@diversifiedfinance/design-system/tailwind';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { useMemo } from 'react';
import { Platform, TextProps, ViewProps } from 'react-native';

export type LinkProps = Props & {
	viewProps?: ViewProps;
	tw?: TW;
	dataset?: any;
	/**
	 * **WEB ONLY**
	 */
	hrefAttrs?: {
		rel: 'noreferrer';
		target?: '_blank';
	};
};

function Link({ viewProps, tw, hrefAttrs, onPress, ...rest }: LinkProps) {
	return (
		<LinkCore
			{...rest}
			Component={Platform.select({
				web: View,
				default: Pressable as any,
			})}
			{...hrefAttrs}
			componentProps={{
				...viewProps,
				tw,
				hrefAttrs,
				onPress,
			}}
		/>
	);
}

type TextLinkProps = Props & {
	textProps?: TextProps;
	variant?: string;
	tw?: TW;
};

const DEFAULT_TEXT_LINK_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

function TextLink({
	textProps,
	variant,
	tw,
	hitSlop,
	onPress,
	...rest
}: TextLinkProps) {
	return (
		<LinkCore
			{...rest}
			Component={Text}
			componentProps={useMemo(
				() => ({
					...textProps,
					variant,
					tw,
					role: 'link',
					userSelect: false,
					onPress,
				}),
				[variant, tw, textProps, onPress]
			)}
			{...Platform.select({
				web: {},
				default: {
					hitSlop: hitSlop ?? DEFAULT_TEXT_LINK_HIT_SLOP,
				},
			})}
		/>
	);
}

export { Link, TextLink };
