import { View } from '@diversifiedfinance/design-system';
import { colors } from '@diversifiedfinance/design-system/tailwind';

export interface ProgressBarProps {
	progress: number;
	color?: string;
}

export default function ProgressBar({ progress, color }: ProgressBarProps) {
	return (
		<View tw="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
			<View
				tw="h-2 rounded-full"
				style={{
					width: `${progress}%`,
					backgroundColor: color ?? colors.diversifiedBlue,
				}}
			></View>
		</View>
	);
}
