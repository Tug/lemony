import {
	Body,
	Catch,
	createHandler,
	Post,
	ValidationPipe,
	BadRequestException,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import type { UserExistResponse } from '@diversifiedfinance/types';
import { hasExistingAccount } from '../../../lib/user';
import { CredentialsDTO } from '../../../dto/auth';

@Catch(exceptionHandler)
class ExistHandler {
	// POST /api/user/exist
	@Post()
	public async userExists(
		@Body(ValidationPipe) body: CredentialsDTO
	): Promise<UserExistResponse> {
		if (!body.email && !body.phoneNumber) {
			throw new BadRequestException();
		}
		const exists = Boolean(await hasExistingAccount(body, { id: true }));
		return {
			exists,
		};
	}
}

export default createHandler(ExistHandler);
