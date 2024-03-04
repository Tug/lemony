import { getApplicantStatusSDK } from '../../../lib/kyc-providers/sumsub';
import { Catch, createHandler, Get, Req } from 'next-api-decorators';
import RequiresAuth from '../../../helpers/api/requires-auth';
import type { NextApiRequest } from 'next';
import { GetApplicantStatusResponseSDK } from '@sumsub/api-types';
import { exceptionHandler } from '../../../lib/error';
import { getUserFromDB } from '../../../lib/auth';

@RequiresAuth()
@Catch(exceptionHandler)
class KYCStatusHandled {
	// GET /api/kyc/status
	@Get()
	public async status(
		@Req() req: NextApiRequest
	): Promise<GetApplicantStatusResponseSDK> {
		const user = await getUserFromDB(req);
		if (!user.sumsubId) {
			throw new Error('User has not passed any KYC check');
		}
		return await getApplicantStatusSDK(user.sumsubId);
	}
}

export default createHandler(KYCStatusHandled);
