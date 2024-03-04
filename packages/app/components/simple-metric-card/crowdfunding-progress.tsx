import { Text, View } from '@diversifiedfinance/design-system';
import SimpleMetricCard, { SimpleMetricCardProps } from './index';
import React, { useEffect } from 'react';
import { CircularProgress } from '@diversifiedfinance/components/circular-progress';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { useTranslation } from 'react-i18next';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

export interface CrowdfundingProgressProps
	extends Partial<SimpleMetricCardProps> {
	progress: number;
	wide?: boolean;
	invert?: boolean;
}

export default function CrowdfundingProgress({
	progress,
	wide = false,
	invert = false,
	...smCardProps
}: CrowdfundingProgressProps) {
	const { t } = useTranslation();
	const isDark = useIsDarkMode();
	const relativeProgress = invert ? 100 - progress : progress;
	const percentProgress = relativeProgress / 100;

	if (wide) {
		return (
			<>
				<SimpleMetricCard
					{...smCardProps}
					label={invert ? t('Left for sale') : t('Sale progress')}
					right={
						<View tw="my-2">
							<CircularProgress
								size={36}
								strokeColor={
									isDark
										? colors.themeYellow
										: colors.diversifiedBlue
								}
								strokeBgColor={
									isDark ? colors.gray[800] : colors.white
								}
								strokeWidth={6}
								progress={percentProgress}
								strokeLinecap="round"
							></CircularProgress>
						</View>
					}
					helpMessage={
						invert
							? t('Percentage of the supply left for sale.')
							: t('Percentage of the supply already sold.')
					}
				>
					<Text tw="text-diversifiedBlue dark:text-themeYellow text-base font-bold">{`${Math.round(
						relativeProgress ?? 0
					)}%`}</Text>
				</SimpleMetricCard>
			</>
		);
	}

	return (
		<SimpleMetricCard {...smCardProps} label={t('Progress')}>
			<View tw="mx-auto">
				<CircularProgress
					size={52}
					strokeColor={
						isDark ? colors.themeYellow : colors.diversifiedBlue
					}
					strokeBgColor={isDark ? colors.gray[800] : colors.white}
					strokeWidth={6}
					progress={percentProgress}
					strokeLinecap="round"
				>
					<Text
						tw={[
							'text-diversifiedBlue dark:text-themeYellow font-bold',
							progress < 100 ? 'text-sm' : 'text-xs',
						]}
					>{`${Math.round(relativeProgress)}%`}</Text>
				</CircularProgress>
			</View>
		</SimpleMetricCard>
	);
}
