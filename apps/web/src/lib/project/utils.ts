import {
	Project as PublicProject,
	WP_Block_Parsed,
	WP_Media,
} from '@diversifiedfinance/types';
import { ProjectWithProductIds } from '../prismadb';
import { DEFAULT_TOKEN_DECIMALS } from '@diversifiedfinance/app/lib/constants';

export const isVisible = (project: ProjectWithProductIds): boolean => {
	const visibilityLevels = {
		production: 0,
		staging: 1,
		development: 2,
	};
	const stage = process.env.STAGE ?? 'production';
	const currentBuildVisibilityLevel =
		visibilityLevels[stage as keyof typeof visibilityLevels] ?? 4;
	// all projects that have a lower or equal visibility value are visible
	return (
		visibilityLevels[project.visibility as keyof typeof visibilityLevels] <=
		currentBuildVisibilityLevel
	);
};

export const getProjectPercent = (project: ProjectWithProductIds): number => {
	if (!project.crowdfundingState) {
		// project percent is deprecated
		return project.percent;
	}
	// required for backward compatibility on the app
	if (project.exitDate) {
		return 100;
	}
	const { collectedAmount, maximumAmount } = project.crowdfundingState;
	if (maximumAmount.sub(collectedAmount).lt(0.03)) {
		return 100;
	}
	const progress = collectedAmount.mul(100).dividedBy(maximumAmount);
	return progress.toNumber();
};

export const toPublicProject = (
	project: ProjectWithProductIds
): PublicProject => ({
	id: project.id,
	slug: project.slug,
	title: project.title ?? '',
	tokenName: project.tokenName,
	tokenSymbol: project.tokenSymbol,
	tokenPrice: project.tokenPrice.toNumber(),
	tokenDecimals: project.tokenDecimals ?? DEFAULT_TOKEN_DECIMALS,
	content: project.content as any as WP_Block_Parsed[],
	description: project.description ?? '',
	percent: getProjectPercent(project),
	tags: project.tags,
	launchDate: project.visibleAt.toString(),
	startOfCrowdfundingDate: project.crowdfundingStartsAt.toString(),
	endOfCrowdfundingDate: project.crowdfundingEndsAt.toString(),
	expectedAPR: project.expectedAPR.toNumber(),
	maxSupply: Number(
		project.maxSupplyInDecimal /
			BigInt(
				Math.pow(10, project.tokenDecimals ?? DEFAULT_TOKEN_DECIMALS)
			)
	),
	durationInYears: project.durationInMonths / 12,
	targetPrice: project.targetPrice.toNumber(),
	media: project.media as any as WP_Media[],
	documentUrl: project.documentUrl,
	feesPercent: project.feesPercent.toNumber(),
	crowdfundingState: project.crowdfundingState
		? {
				collectedAmount:
					project.crowdfundingState.collectedAmount.toNumber(),
				maximumAmount:
					project.crowdfundingState?.maximumAmount.toNumber(),
				updatedAt: project.updatedAt.toString(),
		  }
		: undefined,
	products: project.products?.map(({ productId }) => ({ productId })) ?? [],
	yearsForAPRCalculation: project.yearsForAPRCalculation,
	hasOwnPriceHistory: project.hasOwnPriceHistory,
	computedAPR: project.computedAPR ? project.computedAPR.toNumber() : null,
	isPresale: project.isPresale,
});
