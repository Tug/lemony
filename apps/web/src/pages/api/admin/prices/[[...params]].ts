import prisma from '../../../../lib/prismadb';
import type { NextApiRequest } from 'next';
import { Catch, createHandler, Get, Req, SetHeader } from 'next-api-decorators';
import RequiresAuth, {
	RequiresAdminAuth,
} from '../../../../helpers/api/requires-auth';
import { exceptionHandler } from '../../../../lib/error';

@RequiresAuth()
@RequiresAdminAuth()
@Catch(exceptionHandler)
class AdminPricesHandler {
	// GET /api/admin/prices/last
	@Get('/last')
	@SetHeader('Cache-Control', 'nostore')
	public async list(@Req() req: NextApiRequest): Promise<any> {
		return await prisma.$queryRaw`
			WITH rankedprices AS (
				SELECT
					pp."projectId",
					pp.date,
					pp.period,
					pp.mean,
					pp.min,
					pp.max,
					(pp.mean - LAG(pp.mean) OVER (PARTITION BY pp."projectId" ORDER BY pp.date)) / 
        				NULLIF(LAG(pp.mean) OVER (PARTITION BY pp."projectId" ORDER BY pp.date), 0) * 100 AS price_diff,
    				EXTRACT(DAY FROM pp.date - LAG(pp.date) OVER (PARTITION BY pp."projectId" ORDER BY pp.date)) || ' days ' AS days_diff,
					ROW_NUMBER() OVER (PARTITION BY pp."projectId" ORDER BY pp.date DESC) AS rn
				FROM projectprices pp
			)
			SELECT
				p."tokenName",
				rp."projectId",
				rp.date,
				rp.period,
				rp.mean,
				rp.min,
				rp.max,
				price_diff,
				days_diff
			FROM rankedprices rp
			JOIN projects p ON rp."projectId" = p.id
			WHERE rn <= 5
			ORDER BY "projectId", date ASC;
		`;
	}
}

export default createHandler(AdminPricesHandler);
