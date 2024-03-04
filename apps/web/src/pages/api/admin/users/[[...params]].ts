import prisma from '../../../../lib/prismadb';
import type { NextApiRequest } from 'next';
import {
	Body,
	Catch,
	createHandler,
	Param,
	Get,
	Post,
	Query,
	Req,
	SetHeader,
} from 'next-api-decorators';
import RequiresAuth, {
	RequiresAdminAuth,
} from '../../../../helpers/api/requires-auth';
import { exceptionHandler } from '../../../../lib/error';
import { getMeResponse } from '../../me/[[...params]]';
import { getUserTokens, UserTokenPrice } from '../../../../lib/price/token';
import { getEurWalletOrThrow } from '../../../../lib/payment';
import { getUser } from '../../../../lib/auth';
import Mangopay from 'mangopay2-nodejs-sdk';

class AddUserLabelDTO {
	label: string;
}

@RequiresAuth()
@RequiresAdminAuth()
@Catch(exceptionHandler)
class AdminUsersHandler {
	// GET /api/admin/users/list
	@Get('/list')
	@SetHeader('Cache-Control', 'nostore')
	public async list(@Req() req: NextApiRequest): Promise<any> {
		// u."disclaimerAcceptedAt", u."privacyPolicyAcceptedAt",
		// 	u."termsAndConditionsAcceptedAt",
		const isDev = Boolean(__DEV__);
		const users = await prisma.$queryRaw`
			SELECT
				u.id, u."firstName", u."lastName", u."email", u."phoneNumber",
				u."emailVerified", u."phoneNumberVerified", u."birthDate",
				u.created_at, u.updated_at, u.role, u."kycStatus", u."kycUpdatedAt",
				u."sumsubId", u."mangopayId", u."mangopayWalletId", u."creditsEur",
				COALESCE(SUM(o.amount), 0) AS "totalAmountSpent",
				COALESCE(COUNT(o.id), 0) AS "ordersCount", u."referrerId", u."referralCode", u.xp,
				labels.label_string
			FROM public.users u
			LEFT JOIN public.orders o ON u.id = o."userId" AND (o."status" = 'paid' OR o."status" = 'prepaid' OR o."status" = 'processed' OR o.status = 'preprocessed')
			LEFT JOIN (
			  SELECT "userId", STRING_AGG(label, ',') AS label_string
			  FROM public.userlabels
			  GROUP BY "userId"
			) labels ON u.id = labels."userId"
			WHERE (u.role = 'USER' OR u.role = 'SELLER' OR u.role = ${
				isDev ? 'ADMIN' : 'USER'
			}) and u.disabled = FALSE
			GROUP BY u.id, labels.label_string
		`;
		// const users = await prisma.user.findMany({
		// 	where: {
		// 		role: 'USER',
		// 	},
		// 	include: userWithWalletsIncludes,
		// });
		// const publicUsers = users
		// 	.map(makeUserInfoResponse)
		// 	.map((publicUser) => publicUser.data.profile);

		const res = users.map((user) => ({
			...user,
			// convert big int to Number
			ordersCount: Number(user.ordersCount.toString()),
			totalAmountSpent: Number(user.totalAmountSpent.toString()),
		}));
		return res;
	}

	// GET /api/admin/users/search?q=
	@Get('/search')
	public async findUser(
		@Query('q') searchString: string,
		@Req() req: NextApiRequest
	): Promise<any> {
		if (!searchString) {
			return [];
		}
		// u."disclaimerAcceptedAt", u."privacyPolicyAcceptedAt",
		// 	u."termsAndConditionsAcceptedAt",
		const isDev = Boolean(__DEV__);
		const users = await prisma.$queryRaw`
			SELECT
				u.id, u."firstName", u."lastName", u."email", u."phoneNumber",
				u."emailVerified", u."phoneNumberVerified", u."birthDate",
				u.created_at, u.updated_at, u.role, u."kycStatus", u."kycUpdatedAt",
				u."sumsubId", u."mangopayId", u."mangopayWalletId", u."creditsEur",
				COALESCE(SUM(o.amount), 0) AS "totalAmountSpent",
				COALESCE(COUNT(o.id), 0) AS "ordersCount", u."referrerId", u."referralCode", u.xp,
				labels.label_string
			FROM public.users u
			LEFT JOIN public.orders o ON u.id = o."userId" AND (o."status" = 'paid' OR o."status" = 'prepaid' OR o."status" = 'processed' OR o.status = 'preprocessed')
			LEFT JOIN (
			  SELECT "userId", STRING_AGG(label, ',') AS label_string
			  FROM public.userlabels
			  GROUP BY "userId"
			) labels ON u.id = labels."userId"
			WHERE (u.role = 'USER' OR u.role = 'SELLER' OR u.role = ${
				isDev ? 'ADMIN' : 'USER'
			}) and u.disabled = FALSE and (
				u.id = ${searchString} OR
				u."firstName" ILIKE ${`%${searchString}%`} OR
				u."lastName" ILIKE ${`%${searchString}%`} OR
				u.email ILIKE ${`%${searchString}%`} OR
				u."phoneNumber" ILIKE ${`%${searchString}%`} OR
				labels.label_string ILIKE ${`%${searchString}%`} OR
				u."referralCode" ILIKE ${`%${searchString}%`}
			)
			GROUP BY u.id, labels.label_string
		`;
		const res = users.map((user) => ({
			...user,
			// convert big int to Number
			ordersCount: Number(user.ordersCount.toString()),
			totalAmountSpent: Number(user.totalAmountSpent.toString()),
		}));
		return res;
	}

	// POST /api/admin/users/:userId/add-user-label
	@Post('/:userId/add-label')
	public async addUserLabel(
		@Param('userId') userId: string,
		// validation pipe missing
		@Body() body: AddUserLabelDTO
	): Promise<{ ok: 1 }> {
		await prisma.userLabel.create({
			data: {
				userId,
				label: body.label,
			},
		});
		return { ok: 1 };
	}

	// GET /api/admin/users/:userId => /api/me
	@Get('/:userId')
	public async getUserInformation(
		@Param('userId') userId: string
	): Promise<any> {
		return await getMeResponse(userId);
	}

	// GET /api/admin/users/:userId/tokens => /api/me/tokens
	@Get('/:userId/tokens')
	public async getTokens(
		@Param('userId') userId: string
	): Promise<Array<UserTokenPrice>> {
		return await getUserTokens(userId);
	}

	// GET /api/admin/users/:userId/wallets/eur
	@Get('/:userId/wallets/eur')
	public async getWallet(
		@Param('userId') userId: string
	): Promise<Mangopay.wallet.WalletData> {
		const user = await getUser(userId);
		return await getEurWalletOrThrow(user);
	}
}

export default createHandler(AdminUsersHandler);
