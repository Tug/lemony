import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import { Catch, createHandler, Get, SetHeader } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { syncAllOrders as syncAllOrdersWithAmplitude } from '../../../lib/sync/amplitude';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class SyncUsersHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async syncOrders(): Promise<{
		ok: 1;
	}> {
		await syncAllOrdersWithAmplitude();
		return {
			ok: 1,
		};
	}
}

export default createHandler(SyncUsersHandler);
