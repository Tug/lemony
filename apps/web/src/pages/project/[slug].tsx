import ProjectPage from '@diversifiedfinance/app/pages/project';
import { getVisibleProjects } from '../../lib/project';
import { GetStaticPaths } from 'next';
import { getFirstProjectImage } from '@diversifiedfinance/app/hooks/use-wordpress-image';

export const revalidate = 60;

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
	// When this is true (in preview environments) don't
	// prerender any static pages
	// (faster builds, but slower initial page load)
	if (process.env.SKIP_BUILD_STATIC_GENERATION) {
		return {
			paths: [],
			fallback: 'blocking',
		};
	}
	// TODO next: i18n support, see https://nextjs.org/docs/api-reference/data-fetching/get-static-paths
	// Only statically generate the first page of projects
	try {
		const { projects } = await getVisibleProjects({});
		const paths = projects.map(({ slug }) => ({
			params: { slug },
		}));

		return {
			paths,
			fallback: true,
		};
	} catch (err) {
		return {
			paths: [],
			fallback: true,
		};
	}
};

export async function getStaticProps(context) {
	const slug = context.params.slug;

	const { projects } = await getVisibleProjects({
		slug,
	});

	if (!projects?.[0]) {
		return {
			props: {
				fallback: {},
			},
		};
	}

	const image = await getFirstProjectImage(projects?.[0]);

	return {
		props: {
			meta: {
				title: projects?.[0].title ?? '',
				description: projects?.[0].description ?? '',
				image: image?.source_url ?? '',
			},
			fallback: {
				[`/api/project/${slug}`]: {
					project: projects?.[0],
				},
			},
		},
	};
}

export default ProjectPage;
