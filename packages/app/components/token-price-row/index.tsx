import { Button, ModalSheet } from '@diversifiedfinance/design-system';
import { Image } from '@diversifiedfinance/design-system/image';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import React, { useCallback, useState } from 'react';
import { TokenPriceHistory } from '@diversifiedfinance/types';
import { useFirstProjectImage } from '@diversifiedfinance/app/hooks/use-wordpress-image';
import { printTokenAmount } from '@diversifiedfinance/app/lib/tokens';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useProject } from '@diversifiedfinance/app/hooks/use-project';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import {
	StyledIconLinePriceChart,
	StyledMultiScalePriceChart,
} from '@diversifiedfinance/app/components/price-chart';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';

export const TokenPriceRow = ({
	project,
	prices,
	token,
}: TokenPriceHistory) => {
	const isDark = useIsDarkMode();
	const { t } = useTranslation();
	const redirectTo = useNavigateToScreen();
	const { data: projectFull } = useProject(project.slug);
	const [firstImage] = useFirstProjectImage(projectFull);
	const amount = prices.latest_price[1];
	const [opened, open] = useState<boolean>(false);
	const handleModalShow = useCallback(() => {
		open(true);
	}, [open]);
	const handleModalHide = useCallback(() => {
		open(false);
	}, [open]);

	return (
		<>
			<ModalSheet
				bodyStyle={{ height: '100%' }}
				visible={opened}
				onClose={handleModalHide}
				close={handleModalHide}
				snapPoints={['70%']}
				title={t('Price history')}
			>
				<View tw="w-full p-4">
					<StyledMultiScalePriceChart
						prices={prices}
						precision={2}
						tw="max-w-full"
						aspectRatio={4 / 3}
					/>
				</View>
			</ModalSheet>
			<View tw="flex-row justify-stretch mx-4 mt-2">
				<View tw="mr-[-6px] w-24 h-24 items-center justify-center">
					<View tw="absolute top-0 bottom-0 left-0 right-0 rounded-l-2xl bg-white"></View>
					{firstImage?.source_url && (
						<View tw="h-20 w-20">
							<Image
								resizeMode="contain"
								source={{ uri: firstImage.source_url }}
								tw="rounded-xl"
								style={{
									width: '100%',
									height: '100%',
								}}
								alt={t('Project image')}
							/>
						</View>
					)}
				</View>
				<View tw="grow">
					<View
						tw="mb-2 rounded-r-2xl rounded-bl-2xl bg-themePurple dark:bg-themeOrange p-4"
						dataset={Platform.select({
							web: { testId: 'token-price-row' },
						})}
					>
						<View tw="w-full flex-col items-stretch justify-between">
							<View tw="flex-row items-center">
								<View tw="mr-2 shrink grow basis-0 justify-center">
									<View tw="flex-row items-center">
										<Text
											tw="text-base font-semibold text-gray-900 dark:text-white"
											numberOfLines={2}
										>
											{project.title}
										</Text>
									</View>
									<View tw="my-2">
										<Text tw="text-gray-700 dark:text-gray-200">
											{token.symbol}
										</Text>
									</View>
								</View>
								<View tw="items-end pl-2">
									{printTokenAmount(
										amount,
										({ whole, fractional, separator }) => (
											<View tw="flex-row items-end pb-1">
												<Text tw="text-lg font-inter-bold text-gray-900 dark:text-gray-100">
													{whole}
													{
														<Text tw="text-sm font-inter-semibold tracking-tighter text-gray-900 dark:text-gray-100">
															{separator}
															{fractional ??
																''.padEnd(
																	2,
																	'0'
																)}
														</Text>
													}
													{' €'}
												</Text>
											</View>
										)
									)}
								</View>
							</View>
							<View tw="mx-4 my-2">
								<StyledIconLinePriceChart
									tw="h-8"
									color={isDark ? colors.white : colors.black}
									data={prices?.month}
								/>
							</View>
							<View tw="w-full flex-row gap-x-2 mt-2 mb-1">
								<Button
									variant="primary"
									size="small"
									theme="light"
									onPress={() =>
										redirectTo('project', project)
									}
								>
									{t('View project')}
								</Button>
								<Button
									variant="primary"
									size="small"
									theme="light"
									onPress={handleModalShow}
								>
									View prices
								</Button>
							</View>
						</View>
					</View>
				</View>
			</View>
		</>
	);
};
