import type { NextApiRequest } from 'next';
import { Catch, createHandler, Post, Req } from 'next-api-decorators';
import { exceptionHandler } from '../../lib/error';

@Catch(exceptionHandler)
class LogoutHandler {
	// POST /logout
	@Post()
	// @HttpCode(302)
	// @SetHeader('Location', '/')
	public async logout(@Req() req: NextApiRequest): Promise<{ ok: 1 }> {
		try {
			// try {
			// 	await magic.users.logoutByIssuer(token.did);
			// } catch (error) {
			// 	console.log('Users session with Magic already expired');
			// }
		} catch (error) {
			throw new Error('User is not logged in');
		}
		return { ok: 1 };
	}
}

export default createHandler(LogoutHandler);
