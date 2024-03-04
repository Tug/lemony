import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import { Catch, createHandler, Get, SetHeader } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { processMongopayEvents } from '../../../lib/payment/cron';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class ProcessPaymentsHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async processPayments(): Promise<{
		ok: 1;
	}> {
		await processMongopayEvents();
		return { ok: 1 };
	}
}

export default createHandler(ProcessPaymentsHandler);
