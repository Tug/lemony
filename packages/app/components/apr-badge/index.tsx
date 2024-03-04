import i18n from '@diversifiedfinance/app/lib/i18n';
import { Text, View } from '@diversifiedfinance/design-system';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors, TW } from '@diversifiedfinance/design-system/tailwind';
import {
	ArrowUpRight,
	ArrowDownRight,
	ArrowRight,
} from '@diversifiedfinance/design-system/icon';

export interface APRBadgeProps {
	size?: 'small' | 'regular';
	tw?: string | string[] | TW[];
	value: number;
}

const CONTAINER_TW = {
	regular: 'rounded-xl py-1 px-2',
	small: 'rounded-xl py-0.5 pl-1 pr-1.5',
};

const TEXT_TW = {
	regular: 'text-sm font-bold',
	small: 'text-xs font-bold',
};

export function APRBadge({ tw, size = 'regular', value }: APRBadgeProps) {
	const isDark = useIsDarkMode();
	const aprString = new Intl.NumberFormat(i18n.language, {
		style: 'percent',
		minimumFractionDigits: 0,
		maximumFractionDigits: 1,
	}).format(value / 100);
	const color =
		value === 0
			? colors.gray[500]
			: value >= 0
			? isDark
				? colors.green[500]
				: colors.diversifiedBlue
			: colors.red[400];
	const IconComponent =
		value === 0 ? ArrowRight : value > 0 ? ArrowUpRight : ArrowDownRight;

	return (
		<View
			tw={[
				'flex-row gap-x-1 items-center justify-center',
				CONTAINER_TW[size],
				isDark ? 'bg-gray-800' : 'bg-gray-100',
				tw ?? '',
			]}
		>
			<IconComponent width={18} height={18} color={color} />
			<Text tw={TEXT_TW[size]} style={{ color }}>
				{aprString}
			</Text>
		</View>
	);
}
