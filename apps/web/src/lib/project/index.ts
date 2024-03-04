import { Project as PublicProject } from '@diversifiedfinance/types';
import prisma, {
	ProjectWithProductIds,
	projectWithProductIdsIncludes,
	SchemaTypes,
} from '../prismadb';
import { toPublicProject, isVisible } from './utils';
import { Mango } from '../payment/client';

export async function getProject({
	slug,
}: {
	slug: string;
}): Promise<SchemaTypes.Project> {
	return prisma.project.findFirstOrThrow({
		where: {
			OR: [{ id: slug }, { slug }],
		},
	});
}

export async function getProjectWithProductIds(
	projectIdOrTokenSymbol: string
): Promise<ProjectWithProductIds> {
	return prisma.project.findFirstOrThrow({
		where: {
			OR: [
				{ id: projectIdOrTokenSymbol },
				{ tokenSymbol: projectIdOrTokenSymbol },
			],
		},
		include: projectWithProductIdsIncludes,
	});
}

export async function getVisibleProjects({
	perPage = 25,
	slug,
	cursor,
	language,
}: {
	perPage?: number;
	slug?: string;
	cursor?: string;
	language?: string;
}): Promise<{
	projects: Array<PublicProject>;
	cursor: string | null;
}> {
	const stage = process.env.STAGE ?? 'production';
	let projects = await prisma.project.findMany({
		take: Number(perPage),
		skip: cursor ? 1 : 0,
		...(cursor && {
			cursor: {
				id: cursor,
			},
		}),
		where: {
			...(slug && { slug }),
			visibleAt: {
				lte: new Date(),
			},
			...(stage === 'production' ? { visibility: 'production' } : null),
			...(stage === 'staging'
				? { visibility: { in: ['production', 'staging'] } }
				: null),
		},
		include: projectWithProductIdsIncludes,
		orderBy: {
			id: 'desc',
		},
	});
	if (language && language !== 'en') {
		const projectIds = projects.map(({ id }) => id);
		const projectsLocalized = await prisma.projectI18N.findMany({
			where: {
				projectId: {
					in: projectIds,
				},
				lang: language,
			},
		});
		const projectsLocalizedById = projectsLocalized.reduce(
			(result, projectLocalized) => {
				result[projectLocalized.projectId] = projectLocalized;
				return result;
			},
			{} as any
		);
		projects = projects.map((project) => ({
			...project,
			...projectsLocalizedById[project.id],
		}));
	}

	if (projects.length === 0) {
		return {
			projects: [],
			cursor: null,
		};
	}

	const lastProjectInResult = projects[projects.length - 1];
	const nextCursor = lastProjectInResult.id;
	return {
		projects: projects.filter(isVisible).map(toPublicProject),
		cursor: nextCursor,
	};
}

export async function updateWalletDescription(project: SchemaTypes.Project) {
	const mangoClient = Mango.getDefaultClient();
	return await mangoClient.Wallets.update({
		Id: project.mangopayWalletId,
		Description: `Project wallet for ${project.slug}`.substring(0, 255),
	});
}
