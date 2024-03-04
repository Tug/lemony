import refreshPrice from '../../../lib/price/sync';
import prisma from '../../../lib/prismadb';
import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import {
	Catch,
	createHandler,
	Get,
	Query,
	SetHeader,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { CrawlingResult } from '../../../lib/price/types';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

async function syncProductPrices(productId: string): Promise<CrawlingResult> {
	const product = await prisma.productInInventory.findUniqueOrThrow({
		where: { id: productId },
		include: {
			oracleProducts: {
				include: {
					oracle: true,
				},
			},
		},
	});
	const result = {};
	for (const oracleProduct of product.oracleProducts) {
		result[oracleProduct.id] = await refreshPrice(oracleProduct);
	}
	return result;
}

@RequiresAPIKEY()
@Catch(exceptionHandler)
class SyncPricesHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async syncPrices(
		@Query('productId') productId: string,
		@Query('oracleProductId') oracleProductId: string
	): Promise<{ ok: 1; crawling_result: CrawlingResult }> {
		if (oracleProductId) {
			const oracleProduct = await prisma.oracleProduct.findUniqueOrThrow({
				where: { id: oracleProductId },
				include: {
					oracle: true,
				},
			});
			return {
				ok: 1,
				crawling_result: {
					[oracleProduct.id]: await refreshPrice(oracleProduct),
				},
			};
		}

		return {
			ok: 1,
			crawling_result: await syncProductPrices(productId),
		};
	}
}

export default createHandler(SyncPricesHandler);
