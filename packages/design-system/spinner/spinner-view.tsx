import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import Svg, { Circle } from 'react-native-svg';

const spinnerSizeMap = new Map<SpinnerProps['size'], number>([
	['large', 48],
	['medium', 32],
	['small', 24],
]);

export type SpinnerProps = {
	size?: 'large' | 'medium' | 'small';
	color?: string;
	secondaryColor?: string;
	duration?: number;
};

export const getSpinnerSize = (size: SpinnerProps['size']) => {
	return spinnerSizeMap.get(size) ?? 32;
};

export const SpinnerView = ({
	size = 'medium',
	color = colors.primary[500],
	secondaryColor: secondaryColorProp,
}: SpinnerProps) => {
	const isDark = useIsDarkMode();
	const primaryColor =
		isDark && color === colors.primary[500] ? colors.themeYellow : color;
	const secondaryColor = secondaryColorProp
		? secondaryColorProp
		: isDark
		? '#3F3F46'
		: '#F4F4F5';

	return (
		<Svg
			width={spinnerSizeMap.get(size) ?? 32}
			height={spinnerSizeMap.get(size) ?? 32}
			viewBox="0 0 32 32"
		>
			<Circle
				cx={16}
				cy={16}
				fill="none"
				r={14}
				strokeWidth={4}
				stroke={secondaryColor}
			/>
			<Circle
				cx={16}
				cy={16}
				fill="none"
				r={14}
				strokeWidth={4}
				stroke={primaryColor}
				strokeDasharray={80}
				strokeDashoffset={56}
			/>
		</Svg>
	);
};
