import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import ChevronDown from '@diversifiedfinance/design-system/icon/ChevronDown';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { MotiView } from 'moti';
import { SvgProps } from 'react-native-svg';

interface ChevronDownIconProps extends SvgProps {
	open: boolean;
}

export const ChevronDownIcon: React.FC<ChevronDownIconProps> = ({
	open,
	...rest
}) => {
	const isDarkMode = useIsDarkMode();

	return (
		<MotiView
			animate={{
				rotateZ: open ? '180deg' : '0deg',
			}}
			transition={{
				type: 'timing',
				duration: 300,
			}}
		>
			<ChevronDown
				fill={isDarkMode ? colors.gray[100] : colors.gray[900]}
				{...rest}
			/>
		</MotiView>
	);
};
