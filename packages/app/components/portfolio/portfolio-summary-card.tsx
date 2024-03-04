import {
	Button,
	Pressable,
	Skeleton,
	Text,
	View,
} from '@diversifiedfinance/design-system';
import React from 'react';
import { printMoney } from '@diversifiedfinance/app/lib/mangopay';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { Help } from '@diversifiedfinance/design-system/icon';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { useIntercom } from '@diversifiedfinance/app/lib/intercom';
import { APRBadge } from '@diversifiedfinance/app/components/apr-badge';

export function PortfolioSummaryCard({
	isLoading,
	estimatedPortfolioValue,
	totalInvestedAmount,
	percentChangeFromInvestedAmount,
}: {
	isLoading: boolean;
	estimatedPortfolioValue?: number;
	totalInvestedAmount?: number;
	percentChangeFromInvestedAmount?: number;
}) {
	const { t } = useTranslation();
	const intercom = useIntercom();

	const title = (
		<View tw="my-1 flex-row items-center">
			<Text
				tw={[
					'text-sm',
					Platform.OS !== 'web'
						? 'text-white'
						: 'text-black dark:text-white',
				]}
			>
				{t('Estimated portfolio value')}
			</Text>
			<View tw="mx-2">
				<Button
					variant="text"
					size="xs"
					iconOnly
					onPress={() =>
						intercom.showContent({ type: 'ARTICLE', id: '8617833' })
					}
				>
					<Help color={colors.blueGray[400]} width={16} height={16} />
				</Button>
			</View>
		</View>
	);

	if (isLoading) {
		return (
			<View tw="mt-6 mb-4">
				<View tw="flex-col">
					{title}
					<View tw="my-2">
						<Skeleton height={28} width={120} show />
					</View>
				</View>
			</View>
		);
	}

	return (
		<View tw="mt-6 mb-4 flex-row">
			<View tw="flex-col">
				{title}
				<View tw="my-2">
					<Text
						tw={[
							'text-3xl font-inter font-bold',
							Platform.OS !== 'web'
								? 'text-white'
								: 'text-black dark:text-white',
						]}
					>
						{printMoney(estimatedPortfolioValue)}
					</Text>
				</View>
			</View>
			<View tw="flex-col grow shrink items-end justify-start my-1">
				{Boolean(totalInvestedAmount) && (
					<>
						<View tw="my-1">
							<Text
								tw={[
									'text-xs',
									Platform.OS !== 'web'
										? 'text-white'
										: 'text-black dark:text-white',
								]}
							>
								{t('Total invested')}
							</Text>
						</View>
						<View tw="my-1">
							<Text
								tw={[
									'font-inter-semibold text-sm',
									Platform.OS !== 'web'
										? 'text-white'
										: 'text-black dark:text-white',
								]}
							>
								{printMoney(totalInvestedAmount)}
							</Text>
						</View>
					</>
				)}
				{!Number.isNaN(percentChangeFromInvestedAmount) && (
					<View tw="my-2">
						<APRBadge
							size="small"
							value={percentChangeFromInvestedAmount}
						/>
					</View>
				)}
			</View>
		</View>
	);
}
