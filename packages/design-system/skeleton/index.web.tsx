import { Transition } from '@headlessui/react';
import { baseColors } from 'moti/build/skeleton/shared';

import { useColorScheme } from '@diversifiedfinance/design-system/color-scheme';
import { TW } from '@diversifiedfinance/design-system/tailwind';
import { View } from '@diversifiedfinance/design-system/view';

import { SkeletonProps } from './type';

type Props = SkeletonProps & {
	tw?: TW;
	radius?: number;
};

function Skeleton({
	tw,
	width,
	height,
	show = true,
	colorMode: colorModeProps,
	children,
	radius = 8,
	backgroundColor,
	...props
}: Props) {
	const { colorScheme } = useColorScheme();

	return (
		<View
			{...props}
			tw={['overflow-hidden', tw].join(' ')}
			style={{
				width,
				height,
				borderRadius: radius,
			}}
		>
			{show ? (
				<View
					tw="absolute inset-0 animate-pulse"
					style={{
						backgroundColor:
							baseColors[colorModeProps ?? colorScheme ?? 'light']
								.secondary,
					}}
				/>
			) : (
				children
			)}
		</View>
	);
}

Skeleton.displayName = 'Skeleton';

export { Skeleton };
