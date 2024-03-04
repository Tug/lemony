import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import {
	Catch,
	createHandler,
	Get,
	Query,
	SetHeader,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import prisma from '../../../lib/prismadb';
import { getUser } from '../../../lib/auth';
import { checkUserPendingBenefits } from '../../../lib/benefits';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class ApplyUserBenefitsHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async checkAllBenefits(
		@Query('cursor') cursor: string,
		@Query('userId') userId: string,
		@Query('fakeRun') fakeRun: boolean
	): Promise<{
		ok: number;
		applied: { [userId: string]: string[] };
		errors: string[];
		userCount: number;
		cursor: string | null;
	}> {
		const take = 100;
		const users = await prisma.user.findMany({
			where: {
				...(userId && { id: userId }),
				role: 'USER',
				kycStatus: 'completed',
				NOT: { mangopayWalletId: null },
			},
			select: { id: true },
			take,
			skip: cursor ? 1 : 0,
			...(cursor && {
				cursor: {
					id: cursor,
				},
			}),
		});
		const nextCursor =
			users.length < take ? null : users[users.length - 1].id;
		const benefitsApplied: { [userId: string]: string[] } = {};
		const errors = [];
		for (const userRow of users) {
			const user = await getUser(userRow.id);
			try {
				const benefitsAppliedToUser = await checkUserPendingBenefits(
					user,
					fakeRun
				);
				if (benefitsAppliedToUser && benefitsAppliedToUser.length > 0) {
					benefitsApplied[userRow.id] = benefitsAppliedToUser;
				}
			} catch (err) {
				errors.push(err?.message ?? err?.toString());
			}
		}

		return {
			ok: 1,
			applied: benefitsApplied,
			errors,
			userCount: users?.length ?? 0,
			cursor: nextCursor,
		};
	}
}

export default createHandler(ApplyUserBenefitsHandler);
