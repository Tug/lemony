import prisma from '../../../lib/prismadb';
import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import { Catch, createHandler, Get, SetHeader } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { payoutProject } from '../../../lib/payment';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class PayoutProjectsHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async payoutProjects(): Promise<{
		ok: 1;
		count: number;
	}> {
		const allTerminatedProjects = await prisma.$queryRaw`
			SELECT 
				p.*
			FROM 
				projects p
			INNER JOIN 
				projectcrowdfundingstate pcs ON p."crowdfundingStateId" = pcs.id
			WHERE 
				pcs."collectedAmount" >= pcs."maximumAmount" - 0.03
				AND p.paid = false
				AND p."isPresale" = false
		`;
		for (const project of allTerminatedProjects) {
			await payoutProject(project.id);
		}
		return { ok: 1, count: allTerminatedProjects.length };
	}
}

export default createHandler(PayoutProjectsHandler);
