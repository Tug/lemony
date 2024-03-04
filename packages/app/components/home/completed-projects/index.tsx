import { useProjectFeed } from '@diversifiedfinance/app/hooks/use-project-feed';
import { Button, Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { Platform } from 'react-native';
import { ProjectCarousel } from '@diversifiedfinance/app/components/project-carousel';
import { useNavigateToProjects } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import {
	projectsFilterFunctions,
	sortProjectsByProgress,
} from '@diversifiedfinance/app/utilities';
import { useTranslation } from 'react-i18next';

export function CompletedProjects() {
	const { data: projects, isLoading } = useProjectFeed();
	const navigateToProjects = useNavigateToProjects();
	const { t } = useTranslation();
	const completedProjects = projectsFilterFunctions
		.complete(projects)
		.sort(sortProjectsByProgress);

	const title = (
		<View tw="items-left my-1">
			<Text tw="text-left text-2xl dark:text-white">
				{t('Assets Sold')}
			</Text>
		</View>
	);

	if (completedProjects.length === 0) {
		return (
			<View tw="mb-6">
				{title}
				<View tw="my-4">
					<Text tw="text-black dark:text-white">
						{t('There are no completed assets yet.')}
					</Text>
				</View>
			</View>
		);
	}

	return (
		<View tw="mb-6">
			<View
				style={{
					//@ts-ignore
					overflowY: Platform.OS === 'web' ? 'hidden' : undefined,
				}}
				tw="flex-col"
			>
				{title}
				<View tw="-mx-4">
					<ProjectCarousel
						cardType="small"
						projects={completedProjects}
					/>
				</View>
				<Button
					variant="outlined"
					size="regular"
					onPress={() => navigateToProjects('complete')}
				>
					{t('All completed opportunities')}
				</Button>
			</View>
		</View>
	);
}
