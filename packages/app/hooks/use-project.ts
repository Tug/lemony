import type {
	Project,
	WP_REST_API_Attachment,
} from '@diversifiedfinance/types';
import { ProjectContext } from '@diversifiedfinance/app/context/project-context';
import useSWR, { useSWRConfig } from 'swr';
import { useContext } from 'react';
import { swrFetcher } from './use-infinite-list-query';
import { config } from '@diversifiedfinance/app/lib/i18n';
import { useTranslation } from 'react-i18next';

interface ProjectAPIResponse {
	project: Project;
	media: Pick<WP_REST_API_Attachment, 'id' | 'source_url'>[];
}

export function getProjectAPIPath(
	{ slug }: Pick<Project, 'slug'>,
	lang: string = config.fallbackLng
) {
	return `/api/project/${slug}${
		lang !== config.fallbackLng ? `?lang=${lang}` : ''
	}`;
}

export function useProject(projectSlug?: string) {
	const { project } = useContext(ProjectContext);
	const slug = projectSlug ?? project?.slug;
	const { i18n } = useTranslation();
	const queryState = useSWR<ProjectAPIResponse>(
		slug ? getProjectAPIPath({ slug }, i18n.language) : null,
		swrFetcher,
		{
			revalidateIfStale: true,
			revalidateOnFocus: true,
			revalidateOnReconnect: false,
		}
	);
	const { mutate } = useSWRConfig();

	const medias = queryState.data?.media ?? [];

	// update wp media in SWR cache
	medias.forEach((media) => {
		mutate(`/api/media/${media.id}`, media, {
			revalidate: false,
		});
	});

	return {
		...queryState,
		isLoading: queryState.isLoading,
		data: queryState.data?.project,
		media: queryState.data?.media,
	};
}
