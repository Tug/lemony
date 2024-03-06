import prisma from '../../../../lib/prismadb';
import type { NextApiRequest } from 'next';
import {
	BadRequestException,
	Catch,
	createHandler,
	Get,
	Param,
	Req,
	SetHeader,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../../lib/error';
import RequiresAPIKEY from "../../../../helpers/api/requires-api-key";

@RequiresAPIKEY()
@Catch(exceptionHandler)
class PartnerStatsHandler {
	// GET /api/admin/partner/:id/stats
	@Get('/:id/stats/monthly')
	@SetHeader('Cache-Control', 'nostore')
	public async monthlyStats(
		@Param('id') partnerId: string,
		@Req() req: NextApiRequest
	): Promise<any> {
		const partnerStatsRes = await prisma.$queryRaw`
			select
				date_part('year', orders."createdAt") as year,
				date_part('month', orders."createdAt") AS month,
				SUM(orders."quantityInDecimal" / POWER(10, projects."tokenDecimals") * projects."tokenPrice") as monthly_net_amount
			from orders
			join projects on orders."projectId" = projects.id 
			join users on orders."userId" = users.id
			where (orders.status = 'paid' or orders."status" = 'processed') and users."referrerId" = ${partnerId}
			group by month, year
			order by year, month
		`;
		if (!partnerStatsRes || partnerStatsRes.length === 0) {
			return new BadRequestException('No stats found');
		}

		return {
			data: partnerStatsRes,
		};
	}
}

export default createHandler(PartnerStatsHandler);
