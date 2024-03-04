import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import { Catch, createHandler, Get, SetHeader } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import {
	refreshProjectPrices,
	updateProjectsComputedAPR,
} from '../../../lib/price/project';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class SyncProjectPricesHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async syncProjectPrices(): Promise<{ ok: 1 }> {
		await refreshProjectPrices();
		await updateProjectsComputedAPR();
		return {
			ok: 1,
		};
	}
}

export default createHandler(SyncProjectPricesHandler);
