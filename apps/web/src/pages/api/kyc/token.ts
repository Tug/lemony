import { Catch, createHandler, Post, Req } from 'next-api-decorators';
import RequiresAuth from '../../../helpers/api/requires-auth';
import type { NextApiRequest } from 'next';
import * as sumsub from '../../../lib/kyc-providers/sumsub';
import { CreateAccessTokenResponse } from '@sumsub/api-types';
import { exceptionHandler } from '../../../lib/error';

@RequiresAuth()
@Catch(exceptionHandler)
class SumsubTokenHandler {
	// POST /api/kyc/token
	@Post()
	public async generateToken(
		@Req() req: NextApiRequest
	): Promise<CreateAccessTokenResponse> {
		const userId = req.nextauth.token.sub;
		return await sumsub.createAccessToken(userId);
	}
}

export default createHandler(SumsubTokenHandler);
