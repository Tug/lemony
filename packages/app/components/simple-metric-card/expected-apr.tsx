import {
	ModalSheet,
	Pressable,
	Spinner,
	Text,
	View,
} from '@diversifiedfinance/design-system';
import {
	StyledIconLinePriceChart,
	StyledMultiScalePriceChart,
} from '../price-chart';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import SimpleMetricCard, { SimpleMetricCardProps } from './index';
import React, { useCallback, useState } from 'react';
import { Prices } from '@diversifiedfinance/types';
import { useTranslation } from 'react-i18next';
import i18n from '@diversifiedfinance/app/lib/i18n';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

export interface ExpectedAPRProps extends Partial<SimpleMetricCardProps> {
	value: number;
	data?: Prices;
	wide?: boolean;
	isLoading?: boolean;
	helpMessage?: string;
}

export default function ExpectedAPR({
	value,
	data,
	tw,
	isLoading = false,
	wide = false,
	helpMessage = undefined,
}: ExpectedAPRProps) {
	const { t } = useTranslation();
	const [opened, open] = useState<boolean>(false);
	const handleModalShow = useCallback(() => {
		open(true);
	}, [open]);
	const handleModalHide = useCallback(() => {
		open(false);
	}, [open]);

	const isDark = useIsDarkMode();
	const aprString = new Intl.NumberFormat(i18n.language, {
		style: 'percent',
		minimumFractionDigits: 0,
		maximumFractionDigits: 1,
	}).format(value / 100);

	return (
		<>
			<ModalSheet
				bodyStyle={{ height: '100%' }}
				visible={opened}
				onClose={handleModalHide}
				close={handleModalHide}
				snapPoints={['80%']}
				title={t('Price history')}
			>
				<View tw="w-full p-4">
					<StyledMultiScalePriceChart
						prices={data}
						tw="max-w-full"
						aspectRatio={4 / 3}
					/>
				</View>
			</ModalSheet>
			<SimpleMetricCard
				label={t('Expected APR')}
				tw={tw}
				helpMessage={helpMessage}
			>
				<View
					tw={[
						'flex-col gap-x-2 pt-1',
						wide ? 'flex-row' : 'flex-col',
					]}
				>
					<View>
						<Text tw="text-diversifiedBlue dark:text-themeYellow text-base font-bold">
							{aprString}
						</Text>
					</View>
					{isLoading && (
						<View tw="w-full items-center">
							<Spinner />
						</View>
					)}
					{!isLoading && data?.all && (
						<View tw="shrink grow">
							<Pressable onPress={handleModalShow}>
								<StyledIconLinePriceChart
									tw="h-5"
									color={
										isDark
											? colors.themeYellow
											: colors.diversifiedBlue
									}
									data={data?.all}
								/>
							</Pressable>
						</View>
					)}
				</View>
			</SimpleMetricCard>
		</>
	);
}
