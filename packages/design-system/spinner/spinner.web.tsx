import { getSpinnerSize, SpinnerView, SpinnerProps } from './spinner-view';
import { View } from '@diversifiedfinance/design-system/view';

export const Spinner = ({ size, ...rest }: SpinnerProps) => {
	return (
		<View
			style={{
				height: getSpinnerSize(size),
				width: getSpinnerSize(size),
			}}
			tw="animate-spin"
			role="progressbar"
		>
			<SpinnerView size={size} {...rest} />
		</View>
	);
};
