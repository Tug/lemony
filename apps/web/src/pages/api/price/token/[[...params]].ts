import prisma from '../../../../lib/prismadb';
import {
	Catch,
	createHandler,
	Get,
	NotFoundException,
	Param,
	Req,
	SetHeader,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../../lib/error';
import type { NextApiRequest } from 'next';
import {
	getAllTokensPrices,
	getAllTokensStats,
	getTokenPrices,
	getTokenStats,
} from '../../../../lib/price/token';
import {
	TokenPriceHistory,
	TokensPriceHistoryResponse,
} from '@diversifiedfinance/types';

@Catch(exceptionHandler)
class TokenPriceHandler {
	@Get('/:tokenSymbol/history')
	@SetHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600')
	public async getTokenPriceHistory(
		@Param('tokenSymbol') tokenSymbol: string,
		@Req() req: NextApiRequest
	): Promise<TokenPriceHistory> {
		const prices = await getTokenPrices(tokenSymbol);
		const project = await prisma.project.findUnique({
			where: {
				tokenSymbol,
			},
			select: {
				id: true,
				slug: true,
				title: true,
				tokenSymbol: true,
				tokenName: true,
				tokenDecimals: true,
				tokenPrice: true,
				maxSupplyInDecimal: true,
			},
		});
		return {
			prices,
			currency: 'EUR',
			project: {
				id: project.id,
				slug: project.slug,
				title: project.title,
			},
			token: {
				symbol: project.tokenSymbol,
				name: project.tokenName,
				decimals: project.tokenDecimals,
				introductionPrice: project.tokenPrice.toNumber(),
				maxSupplyInDecimal: Number(project.maxSupplyInDecimal),
			},
		};
	}

	@Get('/:tokenSymbol/last')
	@SetHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600')
	public async getTokenPriceStats(
		@Param('tokenSymbol') tokenSymbol: string,
		@Req() req: NextApiRequest
	): Promise<any> {
		const stats = await getTokenStats(tokenSymbol);
		if (!stats) {
			throw new NotFoundException();
		}
		return {
			data: stats,
		};
	}

	@Get('/history')
	@SetHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600')
	public async getTokensHistory(
		@Req() req: NextApiRequest
	): Promise<TokensPriceHistoryResponse> {
		const tokenPricesByProject = await getAllTokensPrices();
		const projects = await prisma.project.findMany({
			where: {
				id: {
					in: tokenPricesByProject.map(({ projectId }) => projectId),
				},
			},
			select: {
				id: true,
				slug: true,
				title: true,
				tokenSymbol: true,
				tokenName: true,
				tokenDecimals: true,
				tokenPrice: true,
				maxSupplyInDecimal: true,
			},
		});
		return {
			data: tokenPricesByProject.map(
				({ prices, projectId, currency }) => {
					// TODO: avoid linear scan
					const project = projects.find(({ id }) => id === projectId);
					return {
						prices,
						currency,
						project: {
							id: project.id,
							slug: project.slug,
							title: project.title,
						},
						token: {
							symbol: project.tokenSymbol,
							name: project.tokenName,
							decimals: project.tokenDecimals,
							introductionPrice: project.tokenPrice.toNumber(),
							maxSupplyInDecimal: Number(
								project.maxSupplyInDecimal
							),
						},
					};
				}
			),
		};
	}

	@Get('/last')
	@SetHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600')
	public async getTokensStats(@Req() req: NextApiRequest): Promise<any> {
		return {
			data: await getAllTokensStats(),
		};
	}
}

export default createHandler(TokenPriceHandler);
