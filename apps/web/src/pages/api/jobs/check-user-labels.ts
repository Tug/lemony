import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import { Catch, createHandler, Get, SetHeader } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import prisma from '../../../lib/prismadb';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class CheckUserLabelsHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async checkCustomerLabel(): Promise<{
		ok: 1;
	}> {
		const customers: Array<{ id: string }> = await prisma.$queryRaw`
			SELECT DISTINCT u.id
			FROM users u
			JOIN orders o ON u.id = o."userId"
			LEFT JOIN userlabels ul ON u.id = ul."userId" AND ul.label = 'customer'
			WHERE o.status = 'paid' AND o."fundsSource" != 'FREE_CREDITS' AND ul."userId" IS NULL 
		`;
		if (!customers || customers.length === 0) {
			return { ok: 1 };
		}
		await prisma.userLabel.createMany({
			data: customers.map(({ id: userId }) => ({
				userId,
				label: 'customer',
			})),
			skipDuplicates: true,
		});
		return {
			ok: 1,
		};
	}
}

export default createHandler(CheckUserLabelsHandler);
