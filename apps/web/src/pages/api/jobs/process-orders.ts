import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import { Catch, createHandler, Get, SetHeader } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { processOrders, processPresaleOrders } from '../../../lib/payment/cron';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class ProcessOrdersHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async processPayments(): Promise<{
		ok: 1;
	}> {
		await processOrders();
		await processPresaleOrders();
		return { ok: 1 };
	}
}

export default createHandler(ProcessOrdersHandler);
