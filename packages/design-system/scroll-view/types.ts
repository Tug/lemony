import type { TW } from '@diversifiedfinance/design-system/tailwind';
import { ComponentProps } from 'react';
import { ScrollView as ReactNativeScrollView } from 'react-native';

export type ScrollViewProps = {
	tw?: TW;
} & ComponentProps<typeof ReactNativeScrollView>;
