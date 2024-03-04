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
class AdminOrdersHandler {
	// GET /api/admin/orders/list
	@Get('/list')
	@SetHeader('Cache-Control', 'nostore')
	public async list(@Req() req: NextApiRequest): Promise<any> {
		return await prisma.$queryRaw`
			SELECT
				o.id, TO_CHAR(o."createdAt"::timestamp, 'YYYY-MM-DD') as date, 
				u."firstName", u."lastName", TO_CHAR(u."birthDate"::timestamp, 'YYYY-MM-DD') as "birthDate",
				p."tokenSymbol" as project,
				o.amount, o.currency,
				o."quantityInDecimal" / POWER(10, p."tokenDecimals") as qty,
				o."status",
				o."fundsSource"
			FROM public.orders o
			LEFT JOIN public.users u ON u.id = o."userId"
			LEFT JOIN public.projects p ON p.id = o."projectId"
			WHERE (o."status" = 'paid' OR o."status" = 'prepaid' OR o."status" = 'processed' OR o.status = 'preprocessed')
				AND o.type = 'BUY'
				AND (o."fundsSource" = 'WALLET_EUR' OR o."fundsSource" = 'FREE_CREDITS' OR o."fundsSource" = 'FREE_TOKEN')
			ORDER BY o."createdAt" ASC 
		`;
	}
}

export default createHandler(AdminOrdersHandler);
