import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import {
	Catch,
	createHandler,
	Get,
	Query,
	SetHeader,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { ensureHooksActive } from '../../../lib/payment/hook';
import { event } from 'mangopay2-nodejs-sdk';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class SyncPricesHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async syncPricesGet(
		@Query('productId') productId: string
	): Promise<{ ok: 1; invalid_hooks: event.EventType[] }> {
		const invalidHooks = await ensureHooksActive();
		return { ok: 1, invalid_hooks: invalidHooks };
	}
}

export default createHandler(SyncPricesHandler);
