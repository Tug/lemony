import type { MotiSkeletonProps } from 'moti/build/skeleton/types';

import type { TW } from '@diversifiedfinance/design-system/tailwind';

export type SkeletonProps = Omit<MotiSkeletonProps, 'Gradient'> & {
	tw?: TW;
};
