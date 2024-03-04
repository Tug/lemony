import { getUserFromDB } from '../../../lib/auth';
import prisma, { Prisma, userWithWalletsIncludes } from '../../../lib/prismadb';
import type { NextApiRequest } from 'next';
import {
	BadRequestException,
	Body,
	Catch,
	createHandler,
	Delete,
	Get,
	Post,
	Req,
	SetHeader,
	ValidationPipe,
} from 'next-api-decorators';
import RequiresAuth from '../../../helpers/api/requires-auth';
import {
	makeUserInfoResponse,
	validateUpdateUser,
	UserInfoUpdateDTO,
	UserInfoResponseDTO,
} from '../../../dto/userinfo';
import { exceptionHandler } from '../../../lib/error';
import {
	generateUsersOwnReferralCode,
	sendWelcomeEmail,
} from '../../../lib/user';
import { supportedLocales } from '@diversifiedfinance/app/lib/i18n/config';
import acceptLanguage from 'accept-language';
import WithTranslation, {
	I18NMiddlewareContext,
} from '../../../helpers/api/with-translation';
import { NextApiRequestWithContext } from '../../../helpers/api/request-with-contexts';

acceptLanguage.languages(supportedLocales);

@RequiresAuth()
@Catch(exceptionHandler)
class UserInfoHandler {
	// GET /api/userinfo
	@Get('/')
	@SetHeader('Cache-Control', 'nostore')
	public async userinfo(
		@Req() req: NextApiRequest
	): Promise<UserInfoResponseDTO> {
		const user = await getUserFromDB(req);
		// TODO: move this to a more appropriate place
		await generateUsersOwnReferralCode(user);
		return makeUserInfoResponse(user);
	}

	// POST /api/userinfo
	@Post('/')
	@WithTranslation()
	public async editinfo(
		@Req() req: NextApiRequestWithContext<I18NMiddlewareContext>,
		@Body(ValidationPipe) body: UserInfoUpdateDTO
	): Promise<UserInfoResponseDTO> {
		const i18n = req.context.i18n;
		const user = await getUserFromDB(req);
		const newUserData = validateUpdateUser(body);
		const updatedUser = await prisma.$transaction(async (tx) => {
			let newUser = await tx.user.update({
				where: {
					id: user.id,
				},
				data: newUserData,
			});
			if (body.sponsorReferralCode && !user.referrerId) {
				if (body.sponsorReferralCode === user.referralCode) {
					throw new BadRequestException(undefined, [
						{
							field: 'sponsorReferralCode',
							message: i18n.t(
								'You cannot use your own referral code.'
							),
						},
					]);
				}
				try {
					newUser = await tx.user.update({
						where: {
							id: user.id,
						},
						data: {
							referrer: {
								connect: {
									referralCode: body.sponsorReferralCode,
								},
							},
						},
					});
				} catch (err) {
					if (err instanceof Prisma.PrismaClientKnownRequestError) {
						throw new BadRequestException(undefined, [
							{
								field: 'sponsorReferralCode',
								message: i18n.t('Invalid referral code.'),
							},
						]);
					}
					throw err;
				}
			}
			// we try to update the user's email first as it may fail
			if (body.email) {
				try {
					await tx.user.updateMany({
						where: {
							id: req.nextauth.token?.sub,
							emailVerified: null,
						},
						data: { email: body.email },
					});
					newUser.email = body.email;
					// TODO NEXT: send verification email
				} catch (error) {
					if (error instanceof Prisma.PrismaClientKnownRequestError) {
						if (
							Array.isArray(error.meta?.target) &&
							error.meta?.target.includes('email')
						) {
							throw new BadRequestException(undefined, [
								{
									field: 'email',
									message: i18n.t(
										'E-mail is already registered.'
									),
								},
							]);
						}
					}
					throw error;
				}
			}
			return newUser;
		});
		if (
			!user.termsAndConditionsAcceptedAt &&
			updatedUser.termsAndConditionsAcceptedAt
		) {
			await sendWelcomeEmail(updatedUser);
		}
		return makeUserInfoResponse(updatedUser);
	}

	// DELETE /api/userinfo
	@Delete()
	public async deleteAccount(@Req() req: NextApiRequest): Promise<{ ok: 1 }> {
		await prisma.user.update({
			where: {
				id: req.nextauth.token?.sub,
			},
			data: {
				disabled: true,
			},
		});

		return { ok: 1 };
	}

	// GET /api/userinfo/referral
	@Get('/referral')
	@SetHeader('Cache-Control', 'nostore')
	public async referralInfo(
		@Req() req: NextApiRequest
	): Promise<{ referralCount: number; referralTurnedCustomerCount: number }> {
		const res = await prisma.$queryRaw`
			SELECT 
				u.id AS "userId",
				COUNT(referrals.id) AS "totalReferrals",
				SUM(CASE WHEN "customerLabel"."userId" IS NOT NULL THEN 1 ELSE 0 END) AS "referralsTurnedCustomers"
			FROM 
				users u
			LEFT JOIN 
				users referrals ON u.id = referrals."referrerId"
			LEFT JOIN 
				(SELECT "userId" FROM userlabels WHERE label = 'customer') "customerLabel" ON referrals.id = "customerLabel"."userId"
			WHERE u.id = ${req.nextauth.token?.sub}
			GROUP BY 
				u.id;
		`;
		return {
			referralCount: Number(res?.[0]?.totalReferrals ?? 0),
			referralTurnedCustomerCount: Number(
				res?.[0]?.referralsTurnedCustomers ?? 0
			),
		};
	}
}

export default createHandler(UserInfoHandler);
