import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';

export type BlurViewProps = {
	tw?: string;
	children?: JSX.Element;
};
export const BlurView = ({ children, ...rest }: BlurViewProps) => {
	return <View {...rest}>{children}</View>;
};
