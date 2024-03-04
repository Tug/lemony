import { Text, View } from '@diversifiedfinance/design-system';
import { StyledMultiScalePriceChart } from '@diversifiedfinance/app/components/price-chart';
import { PortfolioCard } from '@diversifiedfinance/app/components/portfolio/card';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Prices } from '@diversifiedfinance/types';

export function HistoricPerformance({ prices }: { prices: Prices }) {
	const { t } = useTranslation();
	const { latest_price, latest, ...pricesPerPeriod } = prices ?? {};

	if (!prices || Object.keys(pricesPerPeriod).length === 0) {
		return null;
	}

	return (
		<View>
			<View tw="my-2 items-start">
				<Text tw="text-center text-2xl leading-8 dark:text-white">
					{t('Historic performance')}{' '}
				</Text>
			</View>
			<PortfolioCard tw="my-4 p-5">
				<StyledMultiScalePriceChart
					prices={prices}
					tw="max-w-full"
					aspectRatio={5 / 2}
				/>
			</PortfolioCard>
		</View>
	);
}
