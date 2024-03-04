import { generateToken } from '../../../lib/token';
import {
	Body,
	Catch,
	createHandler,
	Post,
	Req,
	ValidationPipe,
} from 'next-api-decorators';
import { TokenResponseDTO } from '../../../dto/token';
import { OTPCredentialsDTO } from '../../../dto/auth';
import { exceptionHandler, LoginError } from '../../../lib/error';
import { twilioVerifyClient } from '../../../lib/twilio';
import { upsertUser } from '../../../lib/user';
import WithTranslation, {
	I18NMiddlewareContext,
} from '../../../helpers/api/with-translation';
import type { NextApiRequestWithContext } from '../../../helpers/api/request-with-contexts';
import type { APIVersionMiddlewareContext } from '../../../helpers/api/with-api-version';

@WithTranslation()
@Catch(exceptionHandler)
class OTPTokenHandler {
	// POST /api/token/otp
	@Post()
	public async authorize(
		@Body(ValidationPipe) body: OTPCredentialsDTO,
		@Req()
		req: NextApiRequestWithContext<
			I18NMiddlewareContext & APIVersionMiddlewareContext
		>
	): Promise<TokenResponseDTO> {
		const reqContext = req.context;
		const i18n = reqContext.i18n;
		if (!body.code) {
			throw new Error('Invalid credentials');
		}
		const verificationCheck =
			await twilioVerifyClient.verificationChecks.create({
				to: body.phoneNumber ?? body.email,
				code: body.code,
			});
		if (verificationCheck.status !== 'approved') {
			console.error(verificationCheck);
			throw new LoginError(i18n.t('Code is not valid'), 'INVALID_CODE');
		}

		const { user } = await upsertUser(body);

		// simulate gateway timeout when using the hobby plan on vercel (10s timeout)
		// throw new HttpException(504, 'gateway timed out');
		const accessToken = await generateToken(user);
		if (!accessToken) {
			throw new Error('Could not generate token: unknown reason');
		}
		return { access: accessToken, refresh: accessToken };
	}
}

export default createHandler(OTPTokenHandler);
