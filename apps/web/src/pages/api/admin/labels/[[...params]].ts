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
class LabelsHandler {
	// GET /api/admin/labels/list
	@Get('/list')
	@SetHeader('Cache-Control', 'nostore')
	public async list(
		@Req() req: NextApiRequest
	): Promise<{ labels: string[] }> {
		const res = await prisma.$queryRaw`
			SELECT DISTINCT label FROM public.userlabels
		`;

		return {
			labels: (res ?? []).map(({ label }: { label: string }) => label),
		};
	}
}

export default createHandler(LabelsHandler);
