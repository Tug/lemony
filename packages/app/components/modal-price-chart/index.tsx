import {
	Button,
	ModalSheet,
	Pressable,
	Spinner,
	Text,
	View,
} from '@diversifiedfinance/design-system';
import { StyledMultiScalePriceChart } from '../price-chart';
import { useCallback, useState } from 'react';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import ChevronLeft from '@diversifiedfinance/design-system/icon/ChevronLeft';
import colors from '@diversifiedfinance/tailwind-config/colors';
import { Prices } from '@diversifiedfinance/types';
import { useTranslation } from 'react-i18next';

export interface ModalPriceChartProps {
	currency?: string;
	prices?: Prices;
	isLoading: boolean;
	precision?: number;
}

export default function ModalPriceChart({
	isLoading,
	prices,
	precision = 0,
}: ModalPriceChartProps) {
	const { t } = useTranslation();
	const [opened, open] = useState<boolean>(false);
	const handleModalShow = useCallback(() => {
		open(true);
	}, [open]);
	const handleModalHide = useCallback(() => {
		open(false);
	}, [open]);

	const { latest_price, latest, ...pricesPerPeriod } = prices ?? {};
	if (isLoading || !prices || Object.keys(pricesPerPeriod).length === 0) {
		return (
			<View tw="my-4 items-center">
				{isLoading ? (
					<Spinner />
				) : (
					<Text tw="text-gray-900 dark:text-white">
						{t('No information available.')}
					</Text>
				)}
			</View>
		);
	}

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
						prices={prices}
						precision={precision}
						tw="max-w-full"
						aspectRatio={4 / 3}
					/>
				</View>
			</ModalSheet>
			<View tw="m-4">
				<Pressable onPress={handleModalShow}>
					<StyledMultiScalePriceChart
						prices={prices}
						precision={precision}
						tw="max-w-full"
						aspectRatio={2}
						color={colors.primary[500]}
						disabled
					/>
					<View tw="t-0 absolute h-full w-full items-center justify-center">
						<View tw="rounded-3xl bg-black px-4 py-2 text-white dark:bg-white dark:text-gray-900">
							<Text tw="text-white dark:text-black">
								{t('View More')}
							</Text>
						</View>
					</View>
				</Pressable>
			</View>
		</>
	);
}

export interface HeaderProps {
	title: string;
	close: () => void;
	twCenter: string;
	onPressTitle?: () => void;
}

export function Header({
	title,
	close,
	twCenter = '',
	onPressTitle,
}: HeaderProps) {
	const isDark = useIsDarkMode();
	const { top: safeAreaTop } = useSafeAreaInsets();

	return (
		<View
			style={{
				marginTop: safeAreaTop,
			}}
			tw="w-full flex-row items-center justify-between bg-white px-4 py-2 dark:bg-black"
		>
			<View tw="h-12 w-12 items-center justify-center">
				<Button
					onPress={close}
					variant="tertiary"
					size="regular"
					iconOnly
					tw="bg-white px-3 dark:bg-gray-900"
				>
					<ChevronLeft
						width={24}
						height={24}
						color={isDark ? '#FFF' : '#000'}
					/>
				</Button>
			</View>

			<View tw={['mx-2 my-2 flex-1', twCenter]}>
				<Text
					onPress={onPressTitle}
					tw="font-poppins-semibold px-4 py-3.5 text-lg font-bold dark:text-white"
				>
					{title}
				</Text>
			</View>
		</View>
	);
}
