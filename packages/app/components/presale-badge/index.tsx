import { Text, View } from '@diversifiedfinance/design-system';
import SvgTag from '@diversifiedfinance/design-system/icon/Tag';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import React from 'react';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { useTranslation } from 'react-i18next';

export function PresaleBadge({
	tw,
	text = undefined,
}: {
	tw?: string;
	text?: string;
}) {
	const isDark = useIsDarkMode();
	const { t } = useTranslation();
	return (
		<View
			tw={[
				'flex-row items-center rounded-full py-1 px-2 bg-green-50 dark:bg-green-900 my-1 mr-2',
				tw ?? '',
			]}
		>
			<View tw="mr-1">
				<SvgTag
					width={14}
					height={14}
					color={isDark ? colors.white : colors.green[500]}
					strokeWidth={3}
				/>
			</View>
			<Text tw="text-xs font-semibold text-green-500 dark:text-white">
				{text ?? t('Presale')}
			</Text>
		</View>
	);
}
