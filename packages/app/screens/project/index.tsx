import Project404 from './404';
import { ErrorBoundary } from '@diversifiedfinance/app/components/error-boundary';
import ProjectDetails from '@diversifiedfinance/app/components/project-details';
import { createParam } from '@diversifiedfinance/app/navigation/lib/use-param';
import { Spinner, View } from '@diversifiedfinance/design-system';
import React, { Suspense } from 'react';
import { Platform } from 'react-native';
import { useProject } from '@diversifiedfinance/app/hooks/use-project';
import ProjectScrollList from '@diversifiedfinance/app/components/project-scroll-list';
import { ProjectRowScrollListInfinite } from '@diversifiedfinance/app/components/project-row-scroll-list-infinite';
import {
	ProjectsFilterOption,
	projectsFilterOptions,
} from '@diversifiedfinance/types';
import { useTranslation } from 'react-i18next';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';

type Query = {
	slug: string;
};
const { useParam } = createParam<Query>();

function ProjectScreen() {
	const [projectSlug] = useParam('slug');
	return (
		<ErrorBoundary>
			<Suspense fallback={<Spinner />}>
				<Projects slug={projectSlug} />
			</Suspense>
		</ErrorBoundary>
	);
}

function Projects({ slug }: { slug?: string }) {
	const { t } = useTranslation();
	useTrackPageViewed({ name: 'project', params: { slug } });
	const projectsScreenTitles: { [filter in ProjectsFilterOption]: string } = {
		all: t('All Assets'),
		ongoing: t('Live Opportunities'),
		upcoming: t('Upcoming Opportunities'),
		complete: t('Sold Assets'),
	};
	if (!slug || projectsFilterOptions.includes(slug as ProjectsFilterOption)) {
		if (Platform.OS === 'web') {
			return (
				<ProjectScrollList
					filter={(slug ?? 'all') as ProjectsFilterOption}
				/>
			);
		}

		return (
			<ProjectRowScrollListInfinite
				title={
					projectsScreenTitles[
						(slug ?? 'all') as ProjectsFilterOption
					]
				}
				filter={(slug ?? 'all') as ProjectsFilterOption}
			/>
		);
	}

	return <Project slug={slug} />;
}

function Project({ slug }: { slug?: string }) {
	const { data: project, isLoading, mutate } = useProject(slug);

	if (!project && isLoading) {
		return (
			<View tw="h-full w-full items-center justify-center">
				<Spinner />
			</View>
		);
	}

	if (!slug || !project) {
		return <Project404 />;
	}

	return (
		<ProjectDetails
			item={project}
			isRefreshing={isLoading}
			refresh={mutate}
		/>
	);
}

export { ProjectScreen };
