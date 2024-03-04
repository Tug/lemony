import { useProjectFeed } from '@diversifiedfinance/app/hooks/use-project-feed';
import { Button, Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { Platform } from 'react-native';
import { ProjectCarousel } from '@diversifiedfinance/app/components/project-carousel';
import { useNavigateToProjects } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import {
	projectsFilterFunctions,
	projectsGroupingFunctions,
	sortProjectsByAmountSold,
	sortProjectsByProgress,
} from '@diversifiedfinance/app/utilities';
import { useTranslation } from 'react-i18next';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';

interface NextProjectsProps {
	maxItems?: number;
}

export function NextProjects({ maxItems = 4 }: NextProjectsProps) {
	const { data: projects, isLoading } = useProjectFeed();
	const { t } = useTranslation();
	const navigateToProjects = useNavigateToProjects();
	const nextReleasesProjects = projectsFilterFunctions
		.upcoming(projects)
		.sort(sortProjectsByProgress);
	const { user } = useUser();
	const isUserVIP = user?.data.profile.labels?.find((label) =>
		label.startsWith('vip')
	);
	const [_, restProjects] = isUserVIP
		? projectsGroupingFunctions.vipAndNot(nextReleasesProjects)
		: [[], nextReleasesProjects];
	const hasMoreProjects = projects.length > maxItems;

	const title = (
		<View tw="items-left my-1">
			<Text tw="text-left text-2xl dark:text-white">
				{t('Next releases')}
			</Text>
		</View>
	);

	if (nextReleasesProjects.length === 0) {
		return (
			<View tw="mb-6">
				{title}
				<View tw="my-4">
					<Text tw="text-black dark:text-white">
						{t(
							'There are no upcoming opportunities at the moment.'
						)}
					</Text>
				</View>
			</View>
		);
	}

	return (
		<View
			style={{
				//@ts-ignore
				overflowY: Platform.OS === 'web' ? 'hidden' : undefined,
			}}
			tw="flex-col mb-6"
		>
			{title}
			<View tw="-mx-4">
				<ProjectCarousel height={420} projects={restProjects} />
			</View>
			{hasMoreProjects && (
				<View>
					<Button
						variant="outlined"
						size="regular"
						onPress={() => navigateToProjects('upcoming')}
					>
						{t('All next releases')}
					</Button>
				</View>
			)}
		</View>
	);
}
