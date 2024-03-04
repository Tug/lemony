import { SchemaTypes } from '../../../lib/prismadb';
import { getWPProducts } from '../../../lib/wordpress-rest-api';
import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import { Catch, createHandler, Get, SetHeader } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { syncProductsInDB } from '../../../lib/sync/wordpress';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class SyncProductsHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async syncProducts(): Promise<{
		ok: 1;
		products: Array<SchemaTypes.ProductInInventory>;
	}> {
		const wpProducts = await getWPProducts();
		if (!wpProducts || wpProducts.length === 0) {
			return {
				ok: 1,
				products: [],
			};
		}
		const products = await syncProductsInDB(wpProducts);
		return {
			ok: 1,
			products,
		};
	}
}

export default createHandler(SyncProductsHandler);
