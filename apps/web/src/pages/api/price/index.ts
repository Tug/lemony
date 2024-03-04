import {
	Catch,
	createHandler,
	Get,
	NotFoundException,
	Query,
	SetHeader,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { getPricesForProduct, getPricesForProjectV2 } from '../../../lib/price';
import type { PricesResponse } from '@diversifiedfinance/types';
import prisma from '../../../lib/prismadb';

// TODO NEXT: require auth for the pricing API (would need to disable caching)
// @RequiresAuth()
@Catch(exceptionHandler)
class PriceHistoryHandler {
	@Get()
	@SetHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600')
	public async getPriceHistory(
		@Query('productId') productId: string,
		@Query('projectId') projectIdOrTokenSymbol: string
	): Promise<PricesResponse> {
		if (projectIdOrTokenSymbol) {
			const project = await prisma.project.findFirst({
				where: {
					OR: [
						{ id: projectIdOrTokenSymbol },
						{ tokenSymbol: projectIdOrTokenSymbol },
					],
				},
				select: {
					id: true,
				},
			});
			if (!project) {
				throw new NotFoundException('Project not found');
			}
			const prices = await getPricesForProjectV2(project.id);
			return {
				prices,
				currency: 'EUR',
			};
		}

		if (productId) {
			const prices = await getPricesForProduct(productId);

			return {
				prices,
				currency: 'EUR',
			};
		}

		throw new Error(
			'Must pass a projectId or productId for which to get the price data'
		);
	}
}

export default createHandler(PriceHistoryHandler);
