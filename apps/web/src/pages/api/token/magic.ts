import { authorize as magicAuthorize } from '../../../lib/auth-providers/magic';
import { generateToken } from '../../../lib/token';
import {
	Body,
	Catch,
	createHandler,
	Post,
	ValidationPipe,
} from 'next-api-decorators';
import { TokenResponseDTO } from '../../../dto/token';
import { MagicAuthCredentialsDTO } from '../../../dto/auth';
import { exceptionHandler } from '../../../lib/error';

@Catch(exceptionHandler)
class MagicTokenHandler {
	// POST /api/token/magic
	@Post()
	public async authorize(
		@Body(ValidationPipe) body: MagicAuthCredentialsDTO
	): Promise<TokenResponseDTO> {
		const user = await magicAuthorize(body);
		if (!user) {
			throw new Error('Invalid credentials');
		}

		// simulate gateway timeout when using the hobby plan on vercel (10s timeout)
		// throw new HttpException(504, 'gateway timed out');
		const accessToken = await generateToken(user);
		if (!accessToken) {
			throw new Error('Could not generate token: unknown reason');
		}
		return { access: accessToken, refresh: accessToken };
	}
}

export default createHandler(MagicTokenHandler);
