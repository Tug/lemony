import { useProjectFeed } from '../../hooks/use-project-feed';
import { Spinner, Text, View } from '@diversifiedfinance/design-system';
import React, { useCallback, useRef } from 'react';
import { Platform, RefreshControl, useWindowDimensions } from 'react-native';
import { InfiniteScrollList } from '@diversifiedfinance/design-system/infinite-scroll-list';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { usePlatformBottomHeight } from '../../hooks/use-platform-bottom-height';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { useScrollToTop } from '../../lib/react-navigation/native';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { Project, ProjectsFilterOption } from '@diversifiedfinance/types';
import { ProjectRow } from '@diversifiedfinance/app/components/project-row';
import {
	projectsFilterFunctions,
	sortProjectsByAmountSold,
} from '@diversifiedfinance/app/utilities';
import {
	DEFAULT_HEADER_HEIGHT,
	Header,
	HeaderLeft,
} from '@diversifiedfinance/app/components/header';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import { isVIP } from '@diversifiedfinance/app/lib/vip';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';

export function ProjectRowScrollListInfinite({
	title,
	filter,
}: {
	title: string;
	filter: ProjectsFilterOption;
}) {
	const {
		data: projects,
		fetchMore,
		refresh,
		isRefreshing,
		isLoadingMore,
		isLoading,
	} = useProjectFeed();
	const { user } = useUser();
	const isUserVIP = isVIP(user);
	const fixedFilter: ProjectsFilterOption =
		filter === 'ongoing' && isUserVIP ? 'ongoingOrVip' : filter;
	const filteredProjects = projectsFilterFunctions[fixedFilter](
		projects
	).sort(sortProjectsByAmountSold);
	const isDark = useIsDarkMode();
	const bottomBarHeight = usePlatformBottomHeight();
	const { top } = useSafeAreaInsets();
	const headerHeight = top + DEFAULT_HEADER_HEIGHT + 16;
	const { height: windowHeight } = useWindowDimensions();
	const listRef = useRef<any>();
	useScrollToTop(listRef);

	const renderItem = useCallback(
		({ item: project }: ListRenderItemInfo<Project>) => {
			return (
				<View tw="mx-4">
					<ProjectRow item={project} />
				</View>
			);
		},
		[]
	);

	const keyExtractor = useCallback((item: Project) => {
		return item.id.toString();
	}, []);

	const ListFooterComponent = useCallback(() => {
		if (isLoadingMore)
			return (
				<View tw="items-center pb-4">
					<Spinner size="small" />
				</View>
			);
		return null;
	}, [isLoadingMore]);

	const Separator = useCallback(() => <View tw="h-[1px]" />, []);

	if (!isLoading && filteredProjects.length === 0) {
		return (
			<>
				<Header
					tw="bg-blueGray-100 dark:bg-black"
					headerLeft={<HeaderLeft canGoBack={true} withBackground />}
					headerCenter={
						<View tw="flex h-full justify-center border border-4">
							<Text tw="font-poppins-semibold text-center text-lg font-bold">
								{title}
							</Text>
						</View>
					}
					withBackground
					disableCenterAnimation
				/>
				<View tw="mx-8 flex-1 items-center justify-center">
					<Text tw="text-center font-medium text-gray-900 dark:text-gray-100">
						No projects available at the moment. Please try again
						later
					</Text>
				</View>
			</>
		);
	}

	return (
		<View tw="flex-1 bg-blueGray-100 dark:bg-black">
			<Header
				tw="bg-white dark:bg-black"
				headerLeft={<HeaderLeft canGoBack={true} withBackground />}
				headerCenter={
					<View tw="flex h-full justify-center">
						<Text tw="font-poppins-semibold text-center text-lg font-bold text-black dark:text-white">
							{title}
						</Text>
					</View>
				}
				withBackground
				disableCenterAnimation
			/>
			<InfiniteScrollList<Project>
				// useWindowScroll
				data={filteredProjects}
				// for blur header effect on iOS
				style={{
					height: Platform.select({
						default: windowHeight - bottomBarHeight,
						ios: windowHeight,
					}),
				}}
				contentContainerStyle={{
					paddingTop: headerHeight,
					paddingBottom: bottomBarHeight,
				}}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={refresh}
						progressViewOffset={headerHeight}
						tintColor={isDark ? colors.gray[200] : colors.gray[700]}
						colors={[colors.violet[500]]}
						progressBackgroundColor={
							isDark ? colors.gray[200] : colors.gray[100]
						}
					/>
				}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				ItemSeparatorComponent={Separator}
				onEndReached={fetchMore}
				refreshing={isRefreshing}
				onRefresh={refresh}
				ListFooterComponent={ListFooterComponent}
				ref={listRef}
				estimatedItemSize={120}
			/>
		</View>
	);
}
