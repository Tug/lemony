import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import { Text } from '@diversifiedfinance/design-system';
import { PortfolioCard } from './card';
import { PieChart } from 'react-native-chart-kit';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import Svg, { Circle } from 'react-native-svg';
import ProgressBar from '@diversifiedfinance/components/progress-bar';
import { TokenResponseItem } from './user-tokens-card';
import { fromMangopayMoney } from '@diversifiedfinance/app/lib/mangopay';
import { useEurWallet } from '@diversifiedfinance/app/hooks/api-hooks';
import { useTranslation } from 'react-i18next';
import i18n from '@diversifiedfinance/app/lib/i18n';
import { Platform } from 'react-native';

export interface CapitalDistributionCardProps {
	tw?: string;
	tokens: TokenResponseItem[];
}

function getAggregatedAmount(tokens: TokenResponseItem[], tag: string) {
	return tokens
		.filter(({ project }) => project.tags.includes(tag))
		.reduce((result, { initialEurValue }) => {
			return result + initialEurValue;
		}, 0);
}

export function CapitalDistributionCard({
	tokens,
	tw,
}: CapitalDistributionCardProps) {
	const { t } = useTranslation();
	const size = 130;
	const strokeWidth = 60;
	const radius = size / 2;
	const cx = size / 2;
	const cy = size / 2;
	const isDark = useIsDarkMode();
	const { data: eurWallet, isLoading } = useEurWallet();
	let data = [
		{
			name: t('Wine'),
			emoji: '🍷',
			amountEur: getAggregatedAmount(tokens, 'wine'),
			percent: 0,
			color: colors.themeOrange,
			legendFontColor: isDark ? colors.gray['100'] : colors.gray['900'],
			legendFontSize: 15,
		},
		{
			name: t('Watch'),
			emoji: '⌚',
			amountEur: getAggregatedAmount(tokens, 'watches'),
			percent: 0,
			color: isDark ? colors.white : colors.themeBlack,
			legendFontColor: isDark ? colors.gray['100'] : colors.gray['900'],
			legendFontSize: 15,
		},
		{
			name: t('Spirits'),
			emoji: '🥃',
			amountEur: getAggregatedAmount(tokens, 'whisky'),
			percent: 0,
			color: colors.themeYellow,
			legendFontColor: isDark ? colors.gray['100'] : colors.gray['900'],
			legendFontSize: 15,
		},
		{
			name: t('Jewelery'),
			emoji: '💍',
			amountEur: getAggregatedAmount(tokens, 'jewelry'),
			percent: 0,
			color: colors.amber['400'],
			legendFontColor: isDark ? colors.gray['100'] : colors.gray['900'],
			legendFontSize: 15,
		},
		{
			name: t('Art'),
			emoji: '🎨',
			amountEur: getAggregatedAmount(tokens, 'art'),
			percent: 0,
			color: colors.orange['500'],
			legendFontColor: isDark ? colors.gray['100'] : colors.gray['900'],
			legendFontSize: 15,
		},
		{
			name: t('Euro Wallet'),
			emoji: '💳',
			amountEur: fromMangopayMoney(eurWallet?.balance || 0.000001),
			percent: 0,
			color: colors.themeNight,
			legendFontColor: isDark ? colors.gray['100'] : colors.gray['900'],
			legendFontSize: 15,
		},
	].filter(({ amountEur }) => amountEur !== 0);
	const totalEur = data.reduce((acc, sector) => acc + sector.amountEur, 0);
	data = data.map((categoryData) => ({
		...categoryData,
		percent: totalEur > 0 ? (categoryData.amountEur / totalEur) * 100 : 100,
	}));

	if (eurWallet?.balance === 0 && data.length === 1) {
		return null;
	}

	return (
		<View tw={tw ?? ''}>
			<View tw="my-4 items-start">
				<Text
					tw={[
						'text-center text-2xl leading-8',
						Platform.OS !== 'web'
							? 'text-white'
							: 'text-black dark:text-white',
					]}
				>
					{t('Capital distribution')}{' '}
				</Text>
			</View>
			<PortfolioCard tw="p-5">
				<View tw="ml-[-12px] my-2 flex-row justify-stretch">
					<View
						style={{
							width: size,
							height: size,
						}}
					>
						<PieChart
							data={data}
							width={size}
							height={size}
							chartConfig={{
								color: (opacity = 1) =>
									`rgba(26, 255, 146, ${opacity})`,
							}}
							center={[cx * 0.5, 0]}
							backgroundColor={'transparent'}
							accessor="amountEur"
							hasLegend={false}
							avoidFalseZero
						/>
						<View tw="absolute bottom-0 left-0 right-0 top-0 items-center justify-center">
							<Svg
								width={size - strokeWidth}
								height={size - strokeWidth}
								viewBox={`0 0 ${size} ${size}`}
								fill="transparent"
							>
								<Circle
									cx={cx}
									cy={cy}
									r={radius}
									fill={
										isDark
											? colors.gray[900]
											: colors.gray[100]
									}
								/>
							</Svg>
						</View>
					</View>
					<View tw="grow gap-y-3">
						{data.map(({ name, emoji, percent, color }) => (
							<View key={name} tw="mt-2 flex-row items-center">
								<View tw="mr-2">
									<Text>{emoji}</Text>
								</View>
								<View tw="grow basis-0 flex-col">
									<View tw="mb-1">
										<Text tw="text-sm dark:text-white">
											{name}
										</Text>
									</View>
									<View tw="w-full flex-row items-center">
										<View tw="mr-1 grow basis-0 ">
											<ProgressBar
												progress={percent}
												color={color}
											/>
										</View>
										<View tw="min-w-[60px] items-end">
											<Text tw="medium text-sm text-gray-700 dark:text-gray-200">
												{percent.toLocaleString(
													i18n.language,
													{
														minimumFractionDigits: 0,
														maximumFractionDigits: 1,
													}
												)}
												%
											</Text>
										</View>
									</View>
								</View>
							</View>
						))}
					</View>
				</View>
			</PortfolioCard>
		</View>
	);
}
