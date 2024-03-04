import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import { Catch, createHandler, Get, SetHeader } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import prisma from '../../../lib/prismadb';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class SyncProjectPricesHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async deleteExpiredTokenClaims(): Promise<{ ok: 1 }> {
		const tokenClaims = await prisma.userTokenClaim.findMany({
			where: {
				expiresAt: {
					lte: new Date(),
				},
			},
		});
		for (const tokenClaim of tokenClaims) {
			await prisma.$transaction([
				prisma.freeTokenPool.update({
					where: {
						id: tokenClaim.poolId,
					},
					data: {
						offeredInDecimal: {
							decrement: tokenClaim.quantityInDecimal,
						},
					},
				}),
				// TODO: backup that information in some way
				prisma.userTokenClaim.delete({
					where: {
						id: tokenClaim.id,
					},
				}),
			]);
		}
		return {
			ok: 1,
		};
	}
}

export default createHandler(SyncProjectPricesHandler);
