import prisma from '../../../lib/prismadb';
import { generateToken } from '../../../lib/token';
import type { NextApiRequest } from 'next';
import { TokenResponseDTO } from '../../../dto/token';
import {
	Catch,
	createHandler,
	Post,
	Req,
	UnauthorizedException,
} from 'next-api-decorators';
import RequiresAuth from '../../../helpers/api/requires-auth';
import { exceptionHandler } from '../../../lib/error';

@RequiresAuth()
@Catch(exceptionHandler)
class RefreshTokenHandler {
	// POST /api/token/refresh
	@Post()
	public async refresh(
		@Req() req: NextApiRequest
	): Promise<TokenResponseDTO> {
		const userId = req.nextauth.token.sub;
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});
		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		const accessToken = await generateToken(user);
		// Refresh token expiration means:
		// After 3 months of inactivity, user is logged out automatically.
		const refreshToken = await generateToken(user, 60 * 60 * 24 * 31 * 3);
		if (!accessToken || !refreshToken) {
			throw new Error('Could not generate token: unkown reason');
		}
		return { access: accessToken, refresh: refreshToken };
	}
}

export default createHandler(RefreshTokenHandler);
