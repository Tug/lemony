import {
	Body,
	Catch,
	createHandler,
	Post,
	ValidationPipe,
	Req,
} from 'next-api-decorators';
import { exceptionHandler, LoginError } from '../../../../lib/error';
import RequiresAuth from '../../../../helpers/api/requires-auth';
import prisma, {
	UserWithLabels,
	userWithLabelsIncludes,
} from '../../../../lib/prismadb';
import {
	UserAccountVerifyEmailDTO,
	UserAccountVerifyPhoneNumberDTO,
} from '../../../../dto/auth';
import { twilioVerifyClient } from '../../../../lib/twilio';
import type { NextApiRequestWithContext } from '../../../../helpers/api/request-with-contexts';
import WithTranslation, {
	I18NMiddlewareContext,
} from '../../../../helpers/api/with-translation';
import { APIVersionMiddlewareContext } from '../../../../helpers/api/with-api-version';
import { getEurWallet } from '../../../../lib/payment';
import { CannabisException } from '../../../../lib/http-errors';
import { encode } from 'next-auth/jwt';
import { jwtDecrypt } from 'jose';
import hkdf from '@panva/hkdf';

export async function createJWTToken(data: any, maxAge: number = 10 * 60) {
	return await encode({
		token: data,
		secret: process.env.NEXTAUTH_SECRET ?? '',
		maxAge,
	});
}

export async function parseJWTToken(token: string) {
	const encryptionSecret = await hkdf(
		'sha256',
		process.env.NEXTAUTH_SECRET ?? '',
		'',
		'NextAuth.js Generated Encryption Key',
		32
	);
	const { payload } = await jwtDecrypt(token, encryptionSecret, {
		clockTolerance: 0,
	});
	return payload;
}

async function canReassignUser(existingUser: UserWithLabels) {
	const isCustomer = Boolean(
		existingUser.labels.find(({ label }) => label === 'customer')
	);
	const eurWallet = await getEurWallet(existingUser);
	return (
		existingUser.creditsEur.toNumber() === 0 &&
		!isCustomer &&
		(!eurWallet || eurWallet.Balance.Amount === 0)
	);
}

@WithTranslation()
@RequiresAuth()
@Catch(exceptionHandler)
class UserAccountHandler {
	// POST /api/user/account/verify-phone-number
	@Post('/verify-phone-number')
	public async verifyPhoneNumber(
		@Req()
		req: NextApiRequestWithContext<
			I18NMiddlewareContext & APIVersionMiddlewareContext
		>,
		@Body(ValidationPipe) body: UserAccountVerifyPhoneNumberDTO
	): Promise<{ ok: 1 }> {
		const reqContext = req.context;
		const i18n = reqContext.i18n;
		const userId = req.nextauth.token.sub;
		if (!body.code && !body.verificationToken) {
			throw new Error('Invalid credentials');
		}
		let verifiedPhoneNumber;
		if (body.verificationToken) {
			try {
				const payload = await parseJWTToken(body.verificationToken);
				if (payload.id !== userId) {
					throw new Error('Invalid verification token');
				}
				verifiedPhoneNumber = payload.phoneNumber;
			} catch (err) {
				throw new Error('Invalid verification token');
			}
		} else {
			const verificationCheck =
				await twilioVerifyClient.verificationChecks.create({
					to: body.phoneNumber,
					code: body.code,
				});

			if (verificationCheck.status !== 'approved') {
				throw new LoginError(
					i18n.t('Code is not valid'),
					'INVALID_CODE'
				);
			}

			verifiedPhoneNumber = body.phoneNumber;
		}

		// There should be at most one with a verified phone number
		const existingUser = await prisma.user.findFirst({
			where: {
				NOT: { id: userId, phoneNumberVerified: null },
				phoneNumber: verifiedPhoneNumber,
			},
			include: userWithLabelsIncludes,
		});

		if (existingUser) {
			if (!body.reassign) {
				const verificationToken = await createJWTToken({
					id: userId,
					phoneNumber: verifiedPhoneNumber,
				});
				throw new CannabisException(
					i18n.t(
						'Wallet already exists and is linked to another user'
					),
					verificationToken
				);
			} else {
				const canReassign = await canReassignUser(existingUser);
				if (!canReassign) {
					throw new Error(
						i18n.t('Account cannot be reassigned as it has assets.')
					);
				}
				await prisma.user.update({
					where: {
						id: existingUser.id,
					},
					data: {
						phoneNumber: null,
						phoneNumberVerified: null,
					},
				});
			}
		}

		await prisma.user.update({
			where: { id: userId },
			data: {
				phoneNumber: verifiedPhoneNumber,
				phoneNumberVerified: new Date(),
			},
		});
		return { ok: 1 };
	}

	// POST /api/user/account/verify-email
	@Post('/verify-email')
	public async verifyEmail(
		@Req()
		req: NextApiRequestWithContext<
			I18NMiddlewareContext & APIVersionMiddlewareContext
		>,
		@Body(ValidationPipe) body: UserAccountVerifyEmailDTO
	): Promise<{ ok: 1 }> {
		const reqContext = req.context;
		const i18n = reqContext.i18n;
		const userId = req.nextauth.token.sub;
		if (!body.code && !body.verificationToken) {
			throw new Error('Invalid credentials');
		}
		let verifiedEmail: string;
		if (body.verificationToken) {
			try {
				const payload = await parseJWTToken(body.verificationToken);
				if (payload.id !== userId) {
					throw new Error('Invalid verification token');
				}
				verifiedEmail = payload.email as string;
			} catch (err) {
				throw new Error('Invalid verification token');
			}
		} else {
			const verificationCheck =
				await twilioVerifyClient.verificationChecks.create({
					to: body.email,
					code: body.code,
				});

			if (verificationCheck.status !== 'approved') {
				throw new LoginError(
					i18n.t('Code is not valid'),
					'INVALID_CODE'
				);
			}

			verifiedEmail = body.email;
		}

		// There should be at most one with a verified email
		const existingUser = await prisma.user.findFirst({
			where: {
				NOT: { id: userId, emailVerified: null },
				email: verifiedEmail,
			},
			include: userWithLabelsIncludes,
		});
		if (existingUser) {
			if (!body.reassign) {
				const verificationToken = await createJWTToken({
					id: userId,
					email: verifiedEmail,
				});
				throw new CannabisException(
					i18n.t(
						'Wallet already exists and is linked to another user'
					),
					verificationToken
				);
			} else {
				const canReassign = await canReassignUser(existingUser);
				if (!canReassign) {
					throw new Error(
						i18n.t('Account cannot be reassigned as it has assets.')
					);
				}
				await prisma.user.update({
					where: {
						id: existingUser.id,
					},
					data: {
						email: null,
						emailVerified: null,
					},
				});
			}
		}
		await prisma.user.update({
			where: { id: userId },
			data: {
				email: verifiedEmail,
				emailVerified: new Date(),
			},
		});
		return { ok: 1 };
	}
}

export default createHandler(UserAccountHandler);
