import { Catch, createHandler, Get, Req, SetHeader } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { getPricesForPortfolioV2 } from '../../../lib/price';
import type { PricesResponse } from '@diversifiedfinance/types';
import RequiresAuth from '../../../helpers/api/requires-auth';
import type { NextApiRequest } from 'next';

@RequiresAuth()
@Catch(exceptionHandler)
class PortfolioPriceHistoryHandler {
	@Get()
	@SetHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600')
	public async getPriceHistory(
		@Req() req: NextApiRequest
	): Promise<PricesResponse> {
		const prices = await getPricesForPortfolioV2(req.nextauth.token?.sub);
		return {
			prices,
			currency: 'EUR',
		};
	}
}

export default createHandler(PortfolioPriceHistoryHandler);
