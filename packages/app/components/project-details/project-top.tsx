import { renderBlocks } from './render-blocks';
import { Project } from '@diversifiedfinance/types';
import React, { useRef, useState } from 'react';
import Animated from 'react-native-reanimated';
import { Spinner, Text, View } from '@diversifiedfinance/design-system';
import SimpleMetricCard from '../simple-metric-card';
import ExpectedAPR from '../simple-metric-card/expected-apr';
import CrowdfundingProgress from '../simple-metric-card/crowdfunding-progress';
import { usePrice, useUserTokens } from '../../hooks/api-hooks';
import {
	isProjectCompleted,
	isProjectOngoing,
} from '@diversifiedfinance/app/utilities';
import { printMoney } from '@diversifiedfinance/app/lib/mangopay';
import { DataPill } from '@diversifiedfinance/design-system/data-pill';
import { useTranslation } from 'react-i18next';
import { printTokenAmount } from '@diversifiedfinance/app/lib/tokens';
import ProjectTrackingCard from '@diversifiedfinance/app/components/simple-metric-card/project-tracking';
import { PresaleBadge } from '@diversifiedfinance/app/components/presale-badge';

type ProjectTopProps = {
	project: Project;
	animationHeaderPosition?: Animated.SharedValue<number>;
	animationHeaderHeight?: Animated.SharedValue<number>;
};
export const ProjectTop = ({
	project,
	animationHeaderPosition,
	animationHeaderHeight,
}: ProjectTopProps) => {
	const slideshowBlock = project.content.find(
		({ blockName }) => blockName === 'jetpack/slideshow'
	);
	const { data } = usePrice(project.tokenSymbol);
	const isOngoing = isProjectOngoing(project);
	const { t } = useTranslation();
	const { data: tokens } = useUserTokens();
	const userToken = tokens.find(({ project: { id } }) => id === project.id);

	return (
		<>
			{isOngoing && (
				<View tw="absolute right-4 top-4 z-10 w-fit">
					<DataPill
						label={printMoney(project.targetPrice)}
						type="text"
					/>
				</View>
			)}
			{project.isPresale && (
				<View tw="absolute left-4 top-4 z-10 w-fit">
					<PresaleBadge />
				</View>
			)}
			{slideshowBlock && renderBlocks([slideshowBlock])}
			<View tw="mx-4 my-8 flex-row flex-wrap items-stretch justify-between gap-y-4">
				<View tw="basis-1/2 md:basis-1/4">
					<ExpectedAPR
						wide
						value={
							project.computedAPR > 0
								? project.computedAPR
								: project.expectedAPR
						}
						data={data}
						label={
							project.hasOwnPriceHistory
								? t('Avg. annual historical appreciation')
								: t(
										'Avg. annual appreciation of comparable products'
								  )
						}
						helpMessage={
							project.hasOwnPriceHistory
								? t(
										'Return calculated on the basis of actual figures over the last {{years}} years.',
										{
											years: project.yearsForAPRCalculation,
										}
								  )
								: t(
										'Return calculated on the basis of the historical values of comparable products.'
								  )
						}
						tw="mr-2"
					/>
				</View>
				<View tw="basis-1/2 md:basis-1/4">
					{project.isPresale ? (
						<ProjectTrackingCard
							startDate={project.startOfCrowdfundingDate}
							endDate={project.endOfCrowdfundingDate}
							tw="ml-2"
						/>
					) : isProjectCompleted(project) && userToken ? (
						<SimpleMetricCard
							label={t('You invested in this asset')}
							tw="mr-2 md:ml-2"
						>
							<Text tw="text-diversifiedBlue dark:text-themeYellow text-base font-bold">
								{printTokenAmount(userToken.amount)}{' '}
								<Text tw="text-diversifiedBlue dark:text-themeYellow text-sm font-semibold">
									DIFIED
								</Text>
							</Text>
						</SimpleMetricCard>
					) : (
						<CrowdfundingProgress
							wide
							invert
							progress={project.percent}
							tw="ml-2 md:mr-2"
						/>
					)}
				</View>
				<View tw="basis-1/2 md:basis-1/4">
					<SimpleMetricCard
						label={t('Number of tokens in sale')}
						tw="mr-2 md:ml-2"
						helpMessage={t(
							'Maximum number of DIFIED sold for this project.\n1 DIFIED = €10.'
						)}
					>
						<Text tw="text-diversifiedBlue dark:text-themeYellow text-base font-bold">
							{project.maxSupply}{' '}
							<Text tw="text-diversifiedBlue dark:text-themeYellow text-sm font-semibold">
								DIFIED
							</Text>
						</Text>
					</SimpleMetricCard>
				</View>

				<View tw="basis-1/2 md:basis-1/4">
					<SimpleMetricCard
						label={t('Investment duration')}
						tw="ml-2"
						helpMessage={t(
							'Deadline at the end of which Diversified has 6 months to return the net sale price to the investors.'
						)}
					>
						<Text tw="text-diversifiedBlue dark:text-themeYellow text-base font-bold">
							{t('{{project.durationInYears}} years', {
								project,
							})}
						</Text>
					</SimpleMetricCard>
				</View>
			</View>
		</>
	);
};
