import { ScrollViewProps } from './types';
import { styled } from '@diversifiedfinance/design-system/tailwind';
import { forwardRef } from 'react';
import { ScrollView as ReactNativeScrollView } from 'react-native';

const StyledScrollView = styled(ReactNativeScrollView);

const ScrollView = forwardRef(function ScrollView(
	{ tw, ...props }: ScrollViewProps,
	ref: any
) {
	return (
		<StyledScrollView
			keyboardShouldPersistTaps="handled"
			{...props}
			ref={ref}
			tw={Array.isArray(tw) ? tw.join(' ') : tw}
		/>
	);
});

export { ScrollView };
