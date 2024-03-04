import { useFirstProjectImage } from '@diversifiedfinance/app/hooks/use-wordpress-image';
import { Button, Image } from '@diversifiedfinance/design-system';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { Project } from '@diversifiedfinance/types';
import React from 'react';
import { Platform } from 'react-native';
import { isProjectOngoing } from '@diversifiedfinance/app/utilities';
import { useTranslation } from 'react-i18next';
import { useNavigateToProject } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { CircularProgress } from '@diversifiedfinance/components/circular-progress';
import { colors, TW } from '@diversifiedfinance/design-system/tailwind';
import ArrowRight from '@diversifiedfinance/design-system/icon/ArrowRight';
import { usePrice } from '@diversifiedfinance/app/hooks/api-hooks';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

export interface ProjectCardRowProps {
	tw?: string | Array<string> | TW[];
	item: Project;
	itemHeight?: number;
	itemWidth?: number;
	disabled?: boolean;
	showExtraInformation?: boolean;
	inCarousel?: boolean;
}

export function ProjectRow({
	tw,
	item,
	disabled = false,
	showExtraInformation = false,
	inCarousel = false,
}: ProjectCardRowProps) {
	const { t } = useTranslation();
	const isDark = useIsDarkMode();
	const [firstImage] = useFirstProjectImage(item);
	const navigateToProject = useNavigateToProject();
	const percentLeft = 100 - item.percent;
	const percentProgress = percentLeft / 100;
	const { isLoading: isPriceLoading, data: prices } = usePrice(
		item.tokenSymbol
	);
	const hasPriceHistory =
		isPriceLoading || Object.keys(prices ?? {}).length > 1;
	const isOngoing = isProjectOngoing(item);

	return (
		<View
			tw={[
				'flex-row justify-stretch',
				...(Array.isArray(tw) ? tw : [tw ?? '']),
			]}
		>
			<View tw="mr-[-12px] mt-4 w-24 h-24 items-center justify-center">
				<View tw="absolute top-0 bottom-0 left-0 right-0 rounded-xl bg-white -rotate-3"></View>
				{firstImage?.source_url && (
					<Image
						resizeMode="contain"
						source={{ uri: firstImage.source_url }}
						tw="rounded-full"
						width={80}
						height={80}
						alt={t('Project image')}
					/>
				)}
			</View>
			<View tw="grow shrink">
				<View
					tw="mb-4 rounded-2xl bg-themePurple dark:bg-themeOrange p-4"
					dataset={Platform.select({
						web: { testId: 'project-row' },
					})}
				>
					<View tw="w-full flex-col items-center justify-between">
						<View tw="flex-row items-center">
							<View tw="mr-2 shrink grow basis-0 justify-center">
								<View tw="flex-row items-center">
									<Text
										tw="text-lg text-gray-900 dark:text-gray-100"
										numberOfLines={2}
									>
										{item.title}
									</Text>
								</View>
							</View>
							<View tw="items-end pl-2"></View>
						</View>
						{!showExtraInformation ? (
							<View tw="mt-4 mb-1 flex-row">
								<Text tw="mr-4 text-xs font-bold text-gray-900 dark:text-gray-100">
									{t('Expected APR')}
								</Text>
								<Text tw="text-themeNight dark:text-white text-sm font-bold">
									{item.expectedAPR}%
								</Text>
							</View>
						) : (
							<View tw="my-2 flex-row">
								<View tw="flex-1 mt-2 border-r border-gray-600">
									<View tw="">
										<Text tw="text-themeNight dark:text-white text-base font-bold">
											{item.expectedAPR}%
										</Text>
									</View>
									<View tw="mt-2">
										{hasPriceHistory ? (
											<Text tw="mt-4 text-xs font-bold text-gray-700 dark:text-gray-300">
												{t(
													'Avg. annual historical appreciation'
												)}
											</Text>
										) : (
											<Text tw="mt-4 text-xs font-bold text-gray-700 dark:text-gray-300">
												{t(
													'Avg. annual appreciation of comparable products'
												)}
											</Text>
										)}
									</View>
								</View>
								<View tw="ml-3 mt-2 flex-1 flex-col justify-center">
									<View tw="flex-row">
										<CircularProgress
											size={36}
											strokeBgColor="transparent"
											strokeColor={
												isDark
													? colors.themeOrange
													: colors.diversifiedBlue
											}
											strokeWidth={6}
											progress={percentProgress}
											strokeLinecap="round"
										></CircularProgress>
										<View tw="flex-col ml-2 justify-center shrink grow">
											<View tw="my-1">
												<Text tw="text-base font-bold text-diversifiedBlue dark:text-themeOrange">{`${percentLeft.toFixed(
													0
												)}%`}</Text>
											</View>
											<View tw="my-1">
												<Text tw="text-xs font-bold text-gray-600">
													{t('Left for sale')}
												</Text>
											</View>
										</View>
									</View>
								</View>
							</View>
						)}
						<View tw="mt-3 items-stretch w-full">
							<Button
								size="small"
								variant="primary"
								theme="light"
								onPress={() => navigateToProject(item)}
								disabled={disabled}
							>
								<Text tw="text-base font-semibold">
									{isOngoing
										? t('Invest now')
										: t('Learn More')}
								</Text>
								<ArrowRight style={{ marginLeft: 5 }} />
							</Button>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
}
