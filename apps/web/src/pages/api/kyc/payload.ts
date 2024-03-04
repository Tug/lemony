import { buffer } from 'micro';
import { WebhookApplicantVerificationPayload } from '@sumsub/api-types';
import type { NextApiRequest } from 'next';
import { getUser } from '../../../lib/auth';
import * as sumsub from '../../../lib/kyc-providers/sumsub';
import { syncApplicantDataWithUser } from '../../../lib/user';
import { Catch, createHandler, Post, Req } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';

export const config = {
	api: {
		bodyParser: false,
	},
};

@Catch(exceptionHandler)
class SumsubTokenHandler {
	// POST /api/kyc/payload
	@Post()
	public async kycPayload(
		@Req() req: NextApiRequest
	): Promise<{ ok: number }> {
		const rawBody = (await buffer(req)).toString('utf8');
		const signature = req.headers['x-payload-digest']?.toString() ?? '';
		sumsub.verifyWebhookPostData(rawBody, signature);
		const body: WebhookApplicantVerificationPayload = JSON.parse(rawBody);
		if (body.type === 'applicantReviewed') {
			try {
				const user = await getUser(body.externalUserId);
				await syncApplicantDataWithUser(user, true);
			} catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
				return { ok: 0 };
			}
		}
		return { ok: 1 };
	}
}

export default createHandler(SumsubTokenHandler);
