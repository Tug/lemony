import prisma, { SchemaTypes } from '../../../lib/prismadb';
import { getWPProjects } from '../../../lib/wordpress-rest-api';
import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import {
	Catch,
	createHandler,
	Get,
	Query,
	SetHeader,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { syncProjectsInDB } from '../../../lib/sync/wordpress';
import { toPublicProject } from '../../../lib/project/utils';
import { Project as PublicProject } from '@diversifiedfinance/types';
import { updateWalletDescription } from '../../../lib/project';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class SyncProjectsHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async syncProjects(
		@Query('page') page: number = 1,
		@Query('per_page') perPage: number = 50,
		@Query('slug') slug?: string,
		@Query('force') force?: string
	): Promise<{
		ok: 1;
		projects: Array<
			| (PublicProject & { products: SchemaTypes.ProductsInProjects[] })
			| null
		>;
	}> {
		const wpProjects = await getWPProjects({
			page,
			per_page: perPage,
			slug,
			orderby: 'modified',
		});
		if (!wpProjects || wpProjects.length === 0) {
			return {
				ok: 1,
				projects: [],
			};
		}
		const projects = await syncProjectsInDB(wpProjects, Boolean(force));
		return {
			ok: 1,
			projects: projects.map((project) =>
				project
					? {
							...toPublicProject(project),
							products: project.products,
					  }
					: project
			),
		};
	}
}

export default createHandler(SyncProjectsHandler);
