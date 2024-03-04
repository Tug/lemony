import { Button, Skeleton } from '@diversifiedfinance/design-system';
import { Image } from '@diversifiedfinance/design-system/image';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import { Project } from '@diversifiedfinance/types';
import { useFirstProjectImage } from '@diversifiedfinance/app/hooks/use-wordpress-image';
import { printMoney } from '@diversifiedfinance/app/lib/mangopay';
import { usePrice } from '@diversifiedfinance/app/hooks/api-hooks';
import { printTokenAmount } from '@diversifiedfinance/app/lib/tokens';
import { Platform } from 'react-native';
import { useNavigateToProject } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { useTranslation } from 'react-i18next';
import { PresaleBadge } from '@diversifiedfinance/app/components/presale-badge';
import { useFeature } from '@growthbook/growthbook-react';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

export interface TokenRowProps {
	purchasedAt: Date;
	amount: number;
	initialEurValue: number;
	totalPaid: number;
	project: Project;
	orderStatus: 'paid' | 'prepaid' | 'processed' | 'preprocessed';
}

export const TokenRow = ({
	amount,
	initialEurValue,
	totalPaid,
	project,
	orderStatus,
}: TokenRowProps) => {
	const { t } = useTranslation();
	const [firstImage, slideshowAttr] = useFirstProjectImage(project);
	const { data: prices } = usePrice(project.id.toString());
	// const { data: tokenPrice } = useLastTokenPrice(project?.tokenSymbol);
	const userAmount = prices?.latest_price?.[1]
		? (prices?.latest_price?.[1] * initialEurValue) / project.targetPrice
		: 0;
	const navigateToProject = useNavigateToProject();
	const backgroundOnImage = useFeature('project-card-background-on-image').on;
	const isDark = useIsDarkMode();
	const hasBackground =
		backgroundOnImage &&
		!slideshowAttr?.className?.includes('no-background');

	return (
		<View tw="flex-row justify-stretch">
			<View tw="mr-[-4px] w-[84px] h-24 items-center justify-center">
				<View tw="absolute top-0 bottom-0 left-0 right-0 rounded-l-2xl overflow-hidden bg-white dark:bg-gray-800">
					{hasBackground && (
						<Image
							resizeMode="cover"
							style={{
								zIndex: 1,
								position: 'absolute',
								width: '100%',
								height: '100%',
								opacity: isDark ? 0.2 : 0.8,
							}}
							source={require('../project-card/Template_visuel_divisified.webp')}
							alt={t('Project image background')}
						/>
					)}
				</View>
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
			<View tw="grow shrink">
				<View
					tw={[
						'mb-4 rounded-r-2xl rounded-bl-2xl py-4 px-5',
						orderStatus === 'prepaid'
							? 'bg-blueGray-200 dark:bg-blueGray-700'
							: 'bg-themePurple dark:bg-themeOrange',
					]}
					dataset={Platform.select({
						web: { testId: 'project-row' },
					})}
				>
					<View tw="w-full flex-col items-stretch">
						<View tw="flex-col items-start">
							{orderStatus === 'prepaid' && (
								<View tw="mb-2">
									<PresaleBadge />
								</View>
							)}
							<View>
								<Text
									tw="text-sm font-inter font-bold text-gray-900 dark:text-gray-100"
									numberOfLines={2}
								>
									{project.title}
								</Text>
							</View>
						</View>
						<View tw="flex-row justify-stretch my-3">
							<View tw="shrink grow flex-col justify-start gap-1">
								<View tw="flex-row flex-wrap">
									<Text tw="text-blueGray-500 dark:text-gray-300 text-right text-xs">
										{t('Spent:')}
									</Text>
									<Text> </Text>
									<Text tw="text-black dark:text-white text-right text-xs font-bold">
										{printMoney(initialEurValue)}
									</Text>
								</View>
								<View tw="flex-row">
									<Text tw="text-blueGray-500 dark:text-gray-300 text-right text-xs">
										{t('Estimation:')}
									</Text>
									<Text> </Text>
									<Text tw="text-black dark:text-white text-right text-xs font-bold">
										{userAmount
											? printMoney(userAmount)
											: 'N/A'}
									</Text>
								</View>
							</View>
							<View tw="items-end ml-auto">
								{printTokenAmount(
									amount,
									({ whole, fractional, separator }) => (
										<View tw="flex-row items-end mb-1.5">
											<Text tw="text-base font-inter-bold text-gray-900 dark:text-gray-100">
												{whole}
												{fractional && (
													<Text tw="text-sm font-inter-semibold tracking-tighter text-gray-900 dark:text-gray-100">
														{separator}
														{fractional}
													</Text>
												)}
											</Text>
										</View>
									)
								)}
								<View tw="">
									<Text tw="text-xs text-blueGray-500 dark:text-gray-300">
										DIFIED
									</Text>
								</View>
							</View>
						</View>
						<Button
							variant="primary"
							size="small"
							theme="light"
							onPress={() => navigateToProject(project)}
						>
							{t('View project')}
						</Button>
					</View>
				</View>
			</View>
		</View>
	);
};

export const TokenRowSkeleton = () => {
	return (
		<View tw="px-4 pb-4">
			{[1, 2, 3].map((v) => {
				return (
					<View tw="flex-row pt-4" key={v}>
						<View tw="mr-2 overflow-hidden rounded-full">
							<Skeleton width={32} height={32} show />
						</View>
						<View>
							<Skeleton width={100} height={14} show />
							<View tw="h-1" />
							<Skeleton width={80} height={14} show />
						</View>
					</View>
				);
			})}
		</View>
	);
};
