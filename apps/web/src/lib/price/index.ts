import { CrawledPeriod, DiversifiedPeriod } from './types';
import prisma, { ProjectWithProductIds } from '../prismadb';
import { DataPoints, Price, Prices } from '@diversifiedfinance/types';
import { getPercentChange, getSnapshotPrices } from './common';
import {
	dbResultsToPrices,
	sumDataPoints,
	MathPrices,
	formatPrice,
	periodMapper,
} from './utils';
import { getPortfolioProjectsWithProductIds } from '../project/portfolio';
import { getProjectWithProductIds } from '../project';
import { getAvailableProjectPrices, getLatestProjectPrice } from './project';
import { getPortfolioHistoricPerformance } from './portfolio';

export async function getPricesForProduct(productId: string): Promise<Prices> {
	// TODO NEXT: remove this function, it won't work with multiple oracles per product
	const pricesSnapshots = await prisma.oraclePriceSnapshot.findMany({
		where: {
			oracleProduct: {
				productId,
			},
		},
		select: {
			data: true,
			period: true,
			metadata: true,
		},
	});
	const oracleProductId = pricesSnapshots?.[0]?.oracleProducts?.[0]?.id;
	const latestPrice = await prisma.oraclePrice.findFirst({
		where: { oracleProductId },
		orderBy: {
			date: 'desc',
		},
		take: 1,
	});
	return {
		latest: {},
		latest_price: formatPrice(latestPrice),
		...Object.fromEntries(
			pricesSnapshots
				.map((snapshot) =>
					periodMapper[snapshot.period as CrawledPeriod]
						? [
								periodMapper[snapshot.period as CrawledPeriod],
								{
									prices: getSnapshotPrices(snapshot.data),
									percent_change:
										snapshot.metadata?.percentChange ??
										getPercentChange(snapshot.data),
								} as DataPoints,
						  ]
						: null
				)
				.filter(Boolean)
		),
	};
}

export async function getPricesForProjectV2(
	projectId: string,
	{ noPriceDuringCrowdfunding = false } = {}
): Promise<Prices> {
	const projectPrices = await getAvailableProjectPrices(projectId, {
		noPriceDuringCrowdfunding,
	});
	const resultPrices = dbResultsToPrices(projectPrices);

	if (!resultPrices.latest_price) {
		let latestPrice = await getLatestProjectPrice(projectId, {
			noPriceDuringCrowdfunding,
		});
		if (!latestPrice) {
			const project = await prisma.project.findUnique({
				where: { id: projectId },
				select: {
					crowdfundingStartsAt: true,
					targetPrice: true,
				},
			});
			latestPrice = {
				projectId,
				period: '_1month',
				date: project.crowdfundingStartsAt,
				mean: project.targetPrice,
			};
		}
		resultPrices.latest_price = formatPrice(latestPrice);
	}

	return resultPrices;
}

export async function getPricesForPortfolioV2(
	userId: string,
	{ noPriceDuringCrowdfunding = false } = {}
): Promise<Prices> {
	const portfolioPrices = await getPortfolioHistoricPerformance(userId, {
		noPriceDuringCrowdfunding,
	});
	const resultPrices = dbResultsToPrices(portfolioPrices);

	if (!resultPrices.latest_price) {
		resultPrices.latest_price = [Date.now(), 0, 0, 0];
	}

	return resultPrices;
}

export async function getPricesForProject(
	projectIdOrTokenSymbol: string
): Promise<Prices> {
	const project = await getProjectWithProductIds(projectIdOrTokenSymbol);

	if (project.products.length === 0) {
		console.error(
			'No product associated with this project',
			project.tokenSymbol
		);
		throw new Error('No product associated with this project');
	}

	return getPricesForProductsInProjects([project]);
}

export async function getPricesForPortfolio(userId: string): Promise<Prices> {
	const projects = await getPortfolioProjectsWithProductIds(userId);

	return getPricesForProductsInProjects(
		projects,
		process.env.NODE_ENV !== 'development'
	);
}

export async function getPricesForProductsInProjects(
	projects: ProjectWithProductIds[],
	disablePricesPerPeriod = false
): Promise<Prices> {
	const productsPrices = (
		await Promise.all(
			projects.map(async (project) => {
				return await Promise.all(
					project.products.map(async (product) => {
						const prices = await getPricesForProduct(
							product.productId
						);
						// fallback to the project launch price if we don't have any price data
						if (!prices.latest_price) {
							prices.latest_price = [
								project.crowdfundingStartsAt.getTime(),
								project.targetPrice.toNumber(),
							];
						}
						return {
							product,
							prices,
						};
					})
				);
			})
		)
	).flat();

	const latestPrices = productsPrices.reduce(
		(result, { product: { quantity }, prices: { latest_price } }) => {
			if (!latest_price) {
				return result;
			}
			result.prices.push(latest_price);
			result.weights.push(quantity ?? 1);
			return result;
		},
		{ prices: [], weights: [] } as { prices: Price[]; weights: number[] }
	);

	const periods = Array.from(
		new Set<DiversifiedPeriod>(Object.values(periodMapper))
	);

	let pricesPerPeriods = null;
	if (!disablePricesPerPeriod) {
		try {
			// allow it to fail and still return latest price information
			pricesPerPeriods = Object.fromEntries(
				periods
					.map((diversifiedPeriod) => {
						const periodPricesAcrossProducts =
							productsPrices.reduce(
								(result, { product: { quantity }, prices }) => {
									const datapoints =
										prices[diversifiedPeriod];
									if (!datapoints) {
										return result;
									}
									result.datapoints.push(datapoints);
									result.weights.push(quantity ?? 1);
									return result;
								},
								{ datapoints: [], weights: [] } as {
									datapoints: DataPoints[];
									weights: number[];
								}
							);
						if (
							periodPricesAcrossProducts.datapoints.length !==
								productsPrices.length ||
							periodPricesAcrossProducts.datapoints.length === 0
						) {
							return null;
						}
						return [
							diversifiedPeriod,
							sumDataPoints(periodPricesAcrossProducts),
						];
					})
					.filter(Boolean)
			);
		} catch (err) {
			console.error(err);
		}
	} else {
		pricesPerPeriods = null;
	}

	return {
		latest: undefined,
		latest_price:
			latestPrices.prices.length === productsPrices.length
				? MathPrices.sum(latestPrices)
				: undefined,
		...pricesPerPeriods,
	};
}
