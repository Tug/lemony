import prisma from '../../../../lib/prismadb';
import type { NextApiRequest } from 'next';
import { Catch, createHandler, Get, Req, SetHeader } from 'next-api-decorators';
import RequiresAuth, {
	RequiresAdminAuth,
} from '../../../../helpers/api/requires-auth';
import { exceptionHandler } from '../../../../lib/error';
import i18n from '@diversifiedfinance/app/lib/i18n';

@RequiresAuth()
@RequiresAdminAuth()
@Catch(exceptionHandler)
class LabelsHandler {
	// GET /api/admin/free-token-pools
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async list(@Req() req: NextApiRequest): Promise<{ data: any[] }> {
		const pools = await prisma.freeTokenPool.findMany({
			include: {
				project: {
					select: {
						tokenName: true,
						tokenDecimals: true,
					},
				},
			},
		});
		for (const pool of pools) {
			pool.owner = await prisma.user.findUnique({
				where: { id: pool.ownerId },
				select: {
					id: true,
					orders: {
						where: {
							projectId: pool.projectId,
							status: 'processed',
							type: 'SELL',
							fundsSource: 'FREE_TOKEN',
						},
					},
				},
			});
		}

		return {
			data: pools.map((pool) => {
				const claimedQuantityInDecimal = pool.owner.orders.reduce(
					(acc, order) => {
						acc += Number(order.quantityInDecimal);
						return acc;
					},
					0
				);
				const offered =
					Number(pool.offeredInDecimal) /
					Math.pow(10, Number(pool.project.tokenDecimals));
				const claimed =
					claimedQuantityInDecimal /
					Math.pow(10, Number(pool.project.tokenDecimals));
				const percentOffered =
					Number(pool.offeredInDecimal) === 0
						? 0
						: Number(pool.offeredInDecimal) /
						  Number(pool.sizeInDecimal);
				const percentClaimed =
					claimedQuantityInDecimal === 0
						? 0
						: claimedQuantityInDecimal / Number(pool.sizeInDecimal);
				const size =
					Number(pool.sizeInDecimal) /
					Math.pow(10, Number(pool.project.tokenDecimals));

				return {
					id: pool.id,
					// projectId: pool.projectId,
					// ownerId: pool.ownerId,
					tokenName: pool.project.tokenName,
					createdAt: pool.createdAt,
					size,
					offered,
					claimed,
					percentOffered: new Intl.NumberFormat(i18n.language, {
						style: 'percent',
						minimumFractionDigits: 0,
						maximumFractionDigits: 2,
					}).format(percentOffered),
					percentClaimed: new Intl.NumberFormat(i18n.language, {
						style: 'percent',
						minimumFractionDigits: 0,
						maximumFractionDigits: 2,
					}).format(percentClaimed),
				};
			}),
		};
	}
}

export default createHandler(LabelsHandler);
