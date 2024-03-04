import { Text, View } from '@diversifiedfinance/design-system';
import { Crown } from '@diversifiedfinance/design-system/icon';
import React from 'react';
import { useVIPUserLevel } from '@diversifiedfinance/app/hooks/use-vip-user-level';
import { useTranslation } from 'react-i18next';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

export function UserXPBadge({ iconOnly = false }: { iconOnly?: boolean }) {
	const { i18n, t } = useTranslation();
	const isDark = useIsDarkMode();
	const { userXP, currentLevelColor } = useVIPUserLevel();
	return (
		<View tw="flex-row items-center">
			<Crown
				width={19}
				height={12}
				color={
					!iconOnly ? currentLevelColor : isDark ? 'white' : 'black'
				}
			/>
			{!iconOnly && (
				<View tw="ml-2">
					<Text
						tw="text-xs font-medium"
						style={{ color: currentLevelColor }}
					>
						{t('{{amount}} pts', {
							amount: new Intl.NumberFormat(i18n.language, {
								maximumFractionDigits: 0,
							}).format(userXP),
						})}
					</Text>
				</View>
			)}
		</View>
	);
}
