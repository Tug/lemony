import Svg, { Path, G, Defs, Rect, Circle, ClipPath } from 'react-native-svg';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

export const Step = ({
	completed = true,
	isLast = false,
}: {
	completed?: boolean;
	isLast?: boolean;
}) => {
	const isDark = useIsDarkMode();
	const completedColor = isDark ? 'white' : colors.themeNight;
	const iconColor = isDark ? colors.gray[800] : colors.gray[100];
	const fallbackColor = isDark ? colors.gray[400] : colors.gray[600];
	const activeColor = completed ? completedColor : fallbackColor;
	return (
		<Svg width="24" height="66" viewBox="0 0 24 66" fill="none">
			<G>
				<Rect width="24" height="24" rx="12" fill={activeColor} />
				{completed ? (
					<Path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M17.0964 7.39004L9.93638 14.3L8.03638 12.27C7.68638 11.94 7.13638 11.92 6.73638 12.2C6.34638 12.49 6.23638 13 6.47638 13.41L8.72638 17.07C8.94638 17.41 9.32638 17.62 9.75638 17.62C10.1664 17.62 10.5564 17.41 10.7764 17.07C11.1364 16.6 18.0064 8.41004 18.0064 8.41004C18.9064 7.49004 17.8164 6.68004 17.0964 7.38004V7.39004Z"
						fill={iconColor}
					/>
				) : (
					<Circle cx="12" cy="12" r="4" fill={iconColor} />
				)}
			</G>
			{!isLast && (
				<Rect
					x="11"
					y="28"
					width="2"
					height="34"
					rx="1"
					fill={activeColor}
				/>
			)}
		</Svg>
	);
};
