import type {
	Project,
	WP_REST_API_Attachment,
} from '@diversifiedfinance/types';
import {
	Catch,
	createHandler,
	Get,
	Param,
	Query,
	SetHeader,
	NotFoundException,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { getProject, getVisibleProjects } from '../../../lib/project';
import { axios } from '@diversifiedfinance/app/lib/axios';
import { TemplateHandler } from 'easy-template-x';

@Catch(exceptionHandler)
class ProjectHandler {
	// GET /api/project/:slug
	@Get('/:slug')
	// see https://vercel.com/docs/concepts/functions/serverless-functions/edge-caching
	@SetHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600')
	public async project(
		@Param('slug') slug: string,
		@Query('lang') language: string
	): Promise<{
		project: Project;
		media?: Array<
			Pick<WP_REST_API_Attachment, 'id' | 'source_url' | 'media_details'>
		>;
	}> {
		const { projects } = await getVisibleProjects({
			slug,
			language,
		});
		if (!projects?.[0]) {
			throw new NotFoundException('Project not found');
		}
		return { project: projects[0] };
	}

	// GET /api/project/:slug/document
	@Get('/:slug/document')
	@SetHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600')
	public async getDocument(@Param('slug') slug: string): Promise<{ ok: 1 }> {
		const project = await getProject({
			slug,
		});
		if (!project) {
			throw new NotFoundException('Project not found');
		}
		const templateUrl = project.templateUrl;
		if (!templateUrl) {
			throw new NotFoundException(
				'No document available for this project'
			);
		}

		return templateUrl;
	}
}

export default createHandler(ProjectHandler);
