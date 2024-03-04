import { getVisibleProjects } from '../../../lib/project';
import {
	Catch,
	createHandler,
	Get,
	Query,
	SetHeader,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import type { ProjectFeedResponse } from '@diversifiedfinance/types';

@Catch(exceptionHandler)
class ProjectFeedHandler {
	@Get()
	@SetHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600')
	public async getFeed(
		@Query('per_page') perPage: number,
		@Query('slug') slug: string,
		@Query('cursor') cursor: string,
		@Query('lang') language: string
	): Promise<ProjectFeedResponse> {
		return getVisibleProjects({
			perPage,
			slug,
			cursor,
			language,
		});
	}
}

export default createHandler(ProjectFeedHandler);
