import { PortfolioCard } from '@diversifiedfinance/app/components/portfolio/card';
import LineChartUp from '@diversifiedfinance/design-system/icon/LineChartUp';
import { Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

export function PortfolioMetricsRow() {
	const { t } = useTranslation();

	return (
		<View tw="flex-row">
			<PortfolioCard tw="items-center">
				<LineChartUp />
				<View tw="h-6 justify-center">
					<Text tw="font-inter-bold text-md text-themeNight">
						146
					</Text>
				</View>
				<Text tw="font-inter-bold text-sm text-gray-900">
					{t('1M Perf')}
				</Text>
			</PortfolioCard>
			<View tw="w-4"></View>
			<PortfolioCard tw="items-center">
				<LineChartUp />
				<View tw="h-6 justify-center">
					<Text tw="font-inter-bold text-md text-themeNight">
						146
					</Text>
				</View>
				<Text tw="font-inter-bold text-sm text-gray-900">
					{t('On Sale')}
				</Text>
			</PortfolioCard>
			<View tw="w-4"></View>
			<PortfolioCard tw="items-center">
				<LineChartUp />
				<View tw="h-6 justify-center">
					<Text tw="font-inter-bold text-md text-themeNight">
						146
					</Text>
				</View>
				<Text tw="font-inter-bold text-sm text-gray-900">
					{t('1Y Perf')}
				</Text>
			</PortfolioCard>
		</View>
	);
}
