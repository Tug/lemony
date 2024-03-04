import { authorize as ethereumAuthorize } from '../../../lib/auth-providers/ethereum';
import { generateToken } from '../../../lib/token';
import type { NextApiRequest } from 'next';
import { TokenResponseDTO } from '../../../dto/token';
import { Catch, createHandler, Post, Req } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';

@Catch(exceptionHandler)
class RefreshTokenHandler {
	// POST /api/token/ethereum
	@Post()
	public async authorize(
		@Req() req: NextApiRequest
	): Promise<TokenResponseDTO> {
		const user = await ethereumAuthorize(req.body, req);
		if (!user) {
			throw new Error('Invalid credentials');
		}
		const accessToken = await generateToken(user);
		if (!accessToken) {
			throw new Error('Could not generate token: unkown reason');
		}
		return { access: accessToken, refresh: accessToken };
	}
}

export default createHandler(RefreshTokenHandler);
