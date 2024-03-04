import { useProjectFeed } from '../../hooks/use-project-feed';
import { ProjectScreenCardSkeleton } from '../project-screen-card/skeleton';
import Screen from '../screen';
import { Text, View } from '@diversifiedfinance/design-system';
import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { ProjectsFilterOption } from '@diversifiedfinance/types';
import { projectsFilterFunctions } from '@diversifiedfinance/app/utilities';
import { ProjectCardBase } from '@diversifiedfinance/app/components/project-card';

export default function ProjectScrollList({
	filter,
}: {
	filter?: ProjectsFilterOption;
}) {
	const {
		data: projects,
		isLoading: isLoadingProjects,
		mutate,
	} = useProjectFeed();
	const filteredProjects =
		projectsFilterFunctions[filter]?.(projects) ?? projects;

	if (!isLoadingProjects && filteredProjects?.length === 0) {
		return (
			<View tw="mx-8 flex-1 items-center justify-center">
				<Text tw="text-center font-medium text-gray-900 dark:text-gray-100">
					No projects available at the moment. Please try again later
				</Text>
			</View>
		);
	}

	return (
		<Screen isRefreshing={isLoadingProjects}>
			<View
				style={{
					//@ts-ignore
					overflowY: Platform.OS === 'web' ? 'hidden' : undefined,
				}}
				tw={[
					'w-full flex-col px-8',
					Platform.select({
						web: 'md:grid lg:grid-cols-2 lg:gap-x-12 lg:gap-y-4 xl:grid-cols-3',
					}),
				]}
			>
				{isLoadingProjects ? (
					<ProjectScreenCardSkeleton />
				) : (
					(filteredProjects ?? []).map((project, id) => (
						<ProjectCardBase
							key={project.id}
							item={project}
							itemHeight={400}
							showExtraInformation
						/>
					))
				)}
			</View>
		</Screen>
	);
}
