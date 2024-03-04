import { useInfiniteListQuerySWR } from '@diversifiedfinance/app/hooks/use-infinite-list-query';
import { Project, WP_Media } from '@diversifiedfinance/types';
import { useSWRConfig } from 'swr';
import { useCallback, useEffect } from 'react';
import { config, getLang } from '@diversifiedfinance/app/lib/i18n';
import { useTranslation } from 'react-i18next';
import { getProjectAPIPath } from './use-project';
import { Platform } from 'react-native';

interface ProjectFeedAPIResponse {
	projects: Project[];
	cursor: string | null;
}

const PAGE_SIZE = 50;

const isReachingEnd = (response?: ProjectFeedAPIResponse): boolean =>
	Boolean(response && response.cursor === null);

const useProjectFeed = () => {
	const { i18n } = useTranslation();
	const lang = i18n.language;
	const projectsUrlFn = useCallback(
		(index: number, previousPageData?: ProjectFeedAPIResponse) => {
			if (isReachingEnd(previousPageData)) {
				return null;
			}
			return `/api/feed/projects?cursor=${
				previousPageData?.cursor ?? ''
			}${lang !== config.fallbackLng ? `&lang=${lang}` : ''}`;
		},
		[lang]
	);

	const queryState = useInfiniteListQuerySWR<ProjectFeedAPIResponse>(
		projectsUrlFn,
		{
			pageSize: PAGE_SIZE,
			isReachingEnd,
			swr: {
				initialSize: Platform.OS === 'web' ? 5 : 1,
				revalidateOnMount: true,
				revalidateAll: true,
			},
		}
	);

	const { mutate } = useSWRConfig();

	const projects = queryState.data
		? queryState.data
				.map((pageRes) => pageRes && pageRes.projects)
				.filter(Boolean)
				.flat()
		: [];

	useEffect(() => {
		if (queryState.isLoading) {
			return;
		}
		// update projects in SWR cache
		projects.forEach((project) => {
			mutate(
				getProjectAPIPath(project, i18n.language),
				{ project },
				{
					revalidate: false,
				}
			);
		});
	}, [queryState.isLoading]);

	const medias: WP_Media[] = projects.map(({ media }) => media ?? []).flat();

	// update wp media in SWR cache
	medias.forEach((media) => {
		mutate(`/api/media/${media.id}`, media, {
			revalidate: false,
		});
	});

	return { ...queryState, data: projects };
};

export { useProjectFeed };
