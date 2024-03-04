import { Catch, createHandler, Get, Req } from 'next-api-decorators';
import RequiresAuth from '../../../helpers/api/requires-auth';
import type { NextApiRequest } from 'next';
import { exceptionHandler } from '../../../lib/error';
import { getUserFromDB } from '../../../lib/auth';
import { syncUser } from '../../../lib/payment/sync';

@RequiresAuth()
@Catch(exceptionHandler)
class SumsubTokenHandler {
	// GET /api/kyc/sync
	@Get()
	public async sync(@Req() req: NextApiRequest): Promise<{ ok: number }> {
		const user = await getUserFromDB(req);
		try {
			await syncUser(user);
		} catch (err) {
			// ignore mangopay sync errors
			// eslint-disable-next-line no-console
			console.error(err);
		}
		return { ok: 1 };
	}
}

export default createHandler(SumsubTokenHandler);
