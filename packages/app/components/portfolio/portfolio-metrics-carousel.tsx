import { Text, View } from '@diversifiedfinance/design-system';
import React, { useCallback, useMemo } from 'react';
import { FlatList, Platform } from 'react-native';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { useTranslation } from 'react-i18next';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { TokenRowProps } from '@diversifiedfinance/app/components/portfolio/token-row';
import { difiedNumber } from '@diversifiedfinance/app/components/checkout/currency-utils';

interface PortfolioMetricsCardProps {
	title: string;
	metric: number;
	color: string | ((metric: number) => string);
}

function PortfolioMetricsCard({
	title,
	metric,
	color,
}: PortfolioMetricsCardProps) {
	const metricColor = typeof color === 'function' ? color(metric) : color;
	return (
		<View tw="flex-row items-center justify-between rounded-xl bg-white dark:bg-gray-900 py-2 px-3">
			<View tw="flex-col">
				<View tw="my-1">
					<Text tw="text-sm text-gray-600 dark:text-gray-400">
						{title}
					</Text>
				</View>
				<View tw="my-1">
					<Text tw="text-sm font-bold" style={{ color: metricColor }}>
						{metric}
					</Text>
				</View>
			</View>
		</View>
	);
}

export const existingCategories = new Set([
	'wine',
	'watches',
	'whisky',
	'jewelry',
	'art',
]);

export function PortfolioMetricsCarousel({
	tokens,
	tw,
}: {
	tokens?: TokenRowProps[];
	tw?: string;
}) {
	const { t } = useTranslation();
	const isDark = useIsDarkMode();
	const difiedAmount = difiedNumber(
		(tokens ?? []).reduce((acc, token) => {
			return acc + (token.amount ?? 0);
		}, 0)
	);
	const categoryCount = (tokens ?? []).reduce((fullSet, token) => {
		const tokenCategories = (token.project.tags ?? []).filter((tag) =>
			existingCategories.has(tag)
		);
		return new Set([...fullSet, ...tokenCategories]);
	}, new Set()).size;
	const orderCount = (tokens ?? []).length;
	const lastOrderTime = tokens
		? tokens[tokens.length - 1]?.purchasedAt?.getTime()
		: 0;
	const metrics: PortfolioMetricsCardProps[] = useMemo(
		() => [
			{
				title: t('DIFIED'),
				metric: difiedAmount,
				color: isDark ? colors.themeYellow : colors.themeNight,
			},
			{
				title: t('Categories'),
				metric: categoryCount,
				color: isDark ? colors.themeYellow : colors.themeNight,
			},
			{
				title: t('Orders'),
				metric: orderCount,
				color: isDark ? colors.themeYellow : colors.themeNight,
			},
			{
				title: t('Days since last order'),
				metric: Math.floor(
					(Date.now() - lastOrderTime) / (1000 * 60 * 60 * 24)
				),
				color: isDark ? colors.themeYellow : colors.themeNight,
			},
		],
		[t, isDark, difiedAmount, categoryCount, orderCount]
	);

	const renderItem = useCallback(
		({
			item,
			index,
		}: {
			item: PortfolioMetricsCardProps;
			index: number;
		}) => <PortfolioMetricsCard key={index} {...item} />,
		[]
	);

	if (difiedAmount === 0) {
		return null;
	}

	return (
		<View tw={tw ?? ''}>
			<View>
				<Text tw="text-black text-lg font-bricktext dark:text-white">
					{t('Diversification indicators')}
				</Text>
			</View>
			<View tw="my-4 overflow-visible">
				{Platform.OS !== 'web' ? (
					<FlatList<PortfolioMetricsCardProps>
						style={Platform.select({
							web: { width: '100%' },
							default: { overflow: 'visible' },
						})}
						data={metrics}
						horizontal
						showsHorizontalScrollIndicator={false}
						snapToAlignment="start"
						decelerationRate={'fast'}
						renderItem={renderItem}
						ItemSeparatorComponent={() => (
							<View style={{ width: 12 }} />
						)}
					/>
				) : (
					<View tw="grid gap-4 grid-cols-2 grid-rows-2">
						{metrics.map((metric, index) => (
							<PortfolioMetricsCard key={index} {...metric} />
						))}
					</View>
				)}
			</View>
		</View>
	);
}
