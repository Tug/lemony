import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import { Catch, createHandler, Get, SetHeader } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { syncLastUpdatedProfiles as syncLastUpdatedProfilesKlaviyo } from '../../../lib/sync/klaviyo';
import {
	syncAllProjects,
	syncLastUpdatedProfiles as syncLastUpdatedProfilesCustomerIO,
} from '../../../lib/sync/customerio';
import {
	syncAllOrders as syncAllOrdersWithAmplitude,
	syncAllUsers as syncAllUsersWithAmplitude,
} from '../../../lib/sync/amplitude';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class SyncUsersHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async syncUsers(): Promise<{
		ok: 1;
		klaviyo: number;
		customerio: number;
	}> {
		const klaviyo = await syncLastUpdatedProfilesKlaviyo();
		await syncAllProjects();
		const customerio = await syncLastUpdatedProfilesCustomerIO();
		// TODO: be smarter about amplitude sync
		await syncAllUsersWithAmplitude();
		return {
			ok: 1,
			customerio,
			klaviyo,
		};
	}
}

export default createHandler(SyncUsersHandler);
