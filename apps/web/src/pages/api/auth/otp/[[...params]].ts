import {
	Body,
	Catch,
	createHandler,
	Post,
	Query,
	ValidationPipe,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../../lib/error';
import { getTemplateId } from '../../../../lib/emails/sendgrid';
import { CredentialsDTO } from '../../../../dto/auth';
import { twilioVerifyClient } from '../../../../lib/twilio';

@Catch(exceptionHandler)
class AuthHandler {
	// POST /api/auth/otp
	@Post()
	public async login(
		@Body(ValidationPipe) body: CredentialsDTO,
		@Query('locale') locale: string
	): Promise<any> {
		if (!body.phoneNumber && !body.email) {
			throw new Error('Invalid credentials');
		}
		const to = (body.phoneNumber ?? body.email) as string;
		const channel = Boolean(body.phoneNumber) ? 'sms' : 'email';
		await twilioVerifyClient.verifications.create({
			to,
			channel,
			locale,
			// for emails only
			...(channel === 'email' && {
				channelConfiguration: {
					template_id: getTemplateId(
						'LOGIN_WITH_EMAIL_TWILIO',
						locale ?? 'en'
					),
					// login_link_prefix: `${__DEV__ ? 'http' : 'https'}://${
					// 	process.env.NEXT_PUBLIC_WEBSITE_DOMAIN ??
					// 	'app.diversified.fi'
					// }/email-auth-redirect?code=`,
					email: body.email,
				},
			}),
		});
		return { ok: 1 };
	}
}

export default createHandler(AuthHandler);
