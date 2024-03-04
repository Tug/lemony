import type { NextApiRequest } from 'next';
import { Catch, createHandler, Get, Req } from 'next-api-decorators';
import RequiresAuth from '../../helpers/api/requires-auth';
import { exceptionHandler } from '../../lib/error';
import type { GetOrdersResponse } from '@diversifiedfinance/types';
import { getUserOrdersWithPrices } from '../../lib/orders';

@RequiresAuth()
@Catch(exceptionHandler)
class OrderHandler {
	// GET /api/order
	@Get()
	public async listOrders(
		@Req() req: NextApiRequest
	): Promise<GetOrdersResponse> {
		const userId = req.nextauth.token.sub;
		const orders = await getUserOrdersWithPrices(userId);
		return {
			orders,
		};
	}
}

export default createHandler(OrderHandler);
