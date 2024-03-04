import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import { Catch, createHandler, Get, SetHeader } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { processPendingRefunds } from '../../../lib/orders/refund';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class ProcessRefundsHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async processRefunds(): Promise<{
		ok: 1;
	}> {
		await processPendingRefunds();
		return { ok: 1 };
	}
}

export default createHandler(ProcessRefundsHandler);
