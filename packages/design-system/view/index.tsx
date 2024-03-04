import { styled } from '@diversifiedfinance/design-system/tailwind';
import type { TW } from '@diversifiedfinance/design-system/tailwind';
import { forwardRef } from 'react';
import {
	View as ReactNativeView,
	ViewProps as RNViewProps,
} from 'react-native';

export type ViewProps = Omit<RNViewProps, 'tw'> & {
	tw?: string | Array<string> | TW[];
};

const StyledView = styled(ReactNativeView);

const View = forwardRef(function View({ tw, ...props }: ViewProps, ref: any) {
	return (
		<StyledView
			{...props}
			tw={Array.isArray(tw) ? tw.join(' ') : tw}
			ref={ref}
		/>
	);
});

View.displayName = 'View';

export { View };