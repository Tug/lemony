import { useProjectFeed } from '@diversifiedfinance/app/hooks/use-project-feed';
import {
	Button,
	Pressable,
	Text,
	View,
} from '@diversifiedfinance/design-system';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { ProjectRowSkeleton } from '@diversifiedfinance/app/components/project-row/skeleton';
import { useNavigateToProjects } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import {
	projectsFilterFunctions,
	projectsGroupingFunctions,
	sortProjectsByAmountSold,
	sortProjectsByProgress,
} from '@diversifiedfinance/app/utilities';
import { useTranslation } from 'react-i18next';
import { DataPill } from '@diversifiedfinance/design-system/data-pill';
import { useFeature } from '@growthbook/growthbook-react';
// import { ProjectRow } from '@diversifiedfinance/app/components/project-row/design-v2';
import { ProjectRow } from '@diversifiedfinance/app/components/project-row';
import { Square, BulletList } from '@diversifiedfinance/design-system/icon';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { ProjectCardBase } from '@diversifiedfinance/app/components/project-card';
import { useAtom } from 'jotai';
import { Divider } from '@diversifiedfinance/design-system/divider';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { localPreferencesV2Atom } from '@diversifiedfinance/app/lib/preferences';
import { ProjectCardBaseSkeleton } from '@diversifiedfinance/app/components/project-card/skeleton';
import { isVIP } from '@diversifiedfinance/app/lib/vip';
import { ProjectScreenCardSkeleton } from '@diversifiedfinance/app/components/project-screen-card/skeleton';

interface OngoingProjectsProps {
	maxItems?: number;
}

const getAllLabelsIndexedByTag = (t: (key: string) => string) => {
	return {
		'hot-deal': (
			<DataPill
				label={t('Hot Deal')}
				tw="bg-orangeDark-500 mr-1"
				textTw="text-sm text-white font-bold"
			/>
		),
	};
};

const viewModeAtom = localPreferencesV2Atom<'square' | 'list'>(
	'ongoing-projects-view-mode',
	'square'
);

export function OngoingProjects({ maxItems = 5 }: OngoingProjectsProps) {
	const isDark = useIsDarkMode();
	const { user } = useUser();
	const isUserVIP = isVIP(user);
	const { data: projects, isLoading } = useProjectFeed();
	const sortByProgress = useFeature('sort-ongoing-projects-by-progress').on;
	const sortFunction = sortByProgress
		? sortProjectsByProgress
		: sortProjectsByAmountSold;
	const ongoingProjects = isUserVIP
		? projectsFilterFunctions.ongoingOrVip(projects).sort(sortFunction)
		: projectsFilterFunctions.ongoing(projects).sort(sortFunction);
	const [vipProjects, restProjects] = isUserVIP
		? projectsGroupingFunctions.vipAndNot(ongoingProjects)
		: [[], ongoingProjects];
	const hasMoreProjects = restProjects.length > maxItems;
	const navigateToProjects = useNavigateToProjects();
	const { t } = useTranslation();
	const labelsIndexedByTag = useMemo(() => getAllLabelsIndexedByTag(t), [t]);
	const oneTwoLabels = useFeature('one-two-labels-ongoing-projects').on;
	const [viewMode, setViewMode] = useAtom(viewModeAtom);
	const ProjectComponent = viewMode === 'list' ? ProjectRow : ProjectCardBase;

	const title = (
		<View tw="shrink grow items-start my-1">
			<Text tw="text-left text-2xl dark:text-white">
				{t('Live opportunities')}
			</Text>
		</View>
	);

	if (isLoading) {
		return (
			<View tw="mb-6">
				{title}
				<View tw="my-4">
					{viewMode === 'list' ? (
						<>
							<ProjectRowSkeleton />
							<ProjectRowSkeleton />
						</>
					) : (
						<ProjectCardBaseSkeleton />
					)}
				</View>
			</View>
		);
	}

	if (ongoingProjects.length === 0) {
		return (
			<View tw="mb-6">
				{title}
				<View tw="my-4">
					<Text tw="text-black dark:text-white">
						{t('There are no ongoing projects at the moment.')}
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
				tw="w-full flex-col"
			>
				<View tw="flex-row justify-between items-end mb-4">
					{title}
					<View tw="items-end h-6">
						<View tw="flex-row gap-2 mr-2">
							<Pressable onPress={() => setViewMode('square')}>
								<Square
									color={
										viewMode === 'square'
											? isDark
												? 'white'
												: 'black'
											: colors.gray[500]
									}
								/>
							</Pressable>
							<Pressable onPress={() => setViewMode('list')}>
								<BulletList
									color={
										viewMode === 'list'
											? isDark
												? 'white'
												: 'black'
											: colors.gray[500]
									}
								/>
							</Pressable>
						</View>
					</View>
				</View>
				<View tw="mt-2 mb-4">
					{isLoading &&
						[...Array(maxItems)].map((_, id) => (
							<ProjectRowSkeleton key={`project-${id}`} />
						))}
					{!isLoading && (
						<>
							{vipProjects.length > 0 && (
								<>
									{vipProjects.map((project) => (
										<ProjectComponent
											key={project.slug}
											item={project}
											isVIP
										/>
									))}
									<Divider tw="my-4 bg-gray-300 dark:bg-gray-600" />
								</>
							)}
							{restProjects
								.slice(0, maxItems)
								.map((project, id) => {
									const labels = project.tags
										.map((tag) => labelsIndexedByTag[tag])
										.filter(Boolean);
									if (
										oneTwoLabels &&
										vipProjects.length === 0
									) {
										if (id === 0 && !project.isPresale) {
											labels.push(
												<DataPill
													label={t('Most Popular')}
													tw="bg-themeNight mr-1"
													textTw="text-white font-bold"
												/>
											);
										}
									}
									return (
										<ProjectComponent
											key={project.slug}
											item={project}
											labels={labels}
										/>
									);
								})}
						</>
					)}
				</View>
				{hasMoreProjects && (
					<Button
						variant="outlined"
						size="regular"
						onPress={() => navigateToProjects('ongoing')}
					>
						{t('See all opportunities')}
					</Button>
				)}
			</View>
		</View>
	);
}
