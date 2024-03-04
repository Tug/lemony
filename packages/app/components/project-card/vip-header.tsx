import { Text, View } from '@diversifiedfinance/design-system';
import { Crown } from '@diversifiedfinance/design-system/icon';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

export function VipHeader() {
	const { t } = useTranslation();
	const isDark = useIsDarkMode();

	return (
		<View tw="w-full bg-themeYellow dark:bg-themeOrange py-2 px-4 rounded-t-2xl">
			<View tw="flex-row gap-x-2">
				<Crown color={isDark ? colors.white : colors.black} />
				<View tw="flex-row gap-x-1">
					<Text tw="font-bold text-black dark:text-white">
						{t('VIP Exclusive')}
					</Text>
					<Text tw="text-black dark:text-white">
						{t('Expires in less than 48h')}
					</Text>
				</View>
			</View>
		</View>
	);
}
