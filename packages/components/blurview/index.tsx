import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import {
	BlurView as RNBlurView,
	BlurViewProps as RNBlurViewProps,
} from '@react-native-community/blur';
import React from 'react';
import { StyleSheet } from 'react-native';

export type BlurViewProps = RNBlurViewProps & {
	tw?: string;
	children?: JSX.Element;
};
export const BlurView = ({ children, ...rest }: BlurViewProps) => {
	const isDark = useIsDarkMode();

	return (
		<RNBlurView
			style={StyleSheet.absoluteFillObject}
			blurType={isDark ? 'dark' : 'xlight'}
			blurAmount={100}
			{...rest}
		>
			{children}
		</RNBlurView>
	);
};
