import {
	Body,
	Catch,
	createHandler,
	Post,
	ValidationPipe,
} from 'next-api-decorators';
import prisma from '../../../lib/prismadb';
import { exceptionHandler } from '../../../lib/error';
import type { ActivationCodeCheckResponse } from '@diversifiedfinance/types';
import { CredentialsDTO } from '../../../dto/auth';

@Catch(exceptionHandler)
class ActivationCodeCheckHandler {
	// POST /api/user/activation-code-check
	@Post()
	public async checkCode(
		@Body(ValidationPipe) body: CredentialsDTO
	): Promise<ActivationCodeCheckResponse> {
		if (!body.activationCode) {
			return {
				valid: true,
			};
		}
		const referrer = await prisma.user.findUnique({
			where: { referralCode: body.activationCode },
			select: { id: true },
		});
		return {
			valid: Boolean(referrer),
		};
	}
}

export default createHandler(ActivationCodeCheckHandler);
