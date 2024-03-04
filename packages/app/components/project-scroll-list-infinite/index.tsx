import { useProjectFeed } from '../../hooks/use-project-feed';
import { useUser } from '../../hooks/use-user';
import { ProjectScreenCard } from '../project-screen-card';
import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import { Spinner, Text, View } from '@diversifiedfinance/design-system';
import { Skeleton } from 'moti/skeleton';
import React, { useCallback, useRef } from 'react';
import { Platform, RefreshControl, useWindowDimensions } from 'react-native';
import { InfiniteScrollList } from '@diversifiedfinance/design-system/infinite-scroll-list';
import { useHeaderHeight } from '../../lib/react-navigation/elements';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { usePlatformBottomHeight } from '../../hooks/use-platform-bottom-height';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { useScrollToTop } from '../../lib/react-navigation/native';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { Project } from '@diversifiedfinance/types';

const Header = () => {
	const { data: projects } = useProjectFeed();
	const { user, isLoading: isLoadingUser } = useUser();
	const profileData = user?.data.profile;

	if (isLoadingUser) {
		return (
			<View>
				<View tw="my-2">
					<Skeleton height={16} width="40%" radius="square" />
				</View>
				<View tw="mb-4 mt-2">
					<Skeleton height={32} width="66%" radius="square" />
				</View>
			</View>
		);
	}

	return (
		<View>
			<View tw="mb-4 mt-2">
				<Text
					tw={[
						'font-inter-bold text-2xl font-bold',
						Platform.OS === 'web' ? 'text-black' : 'text-white',
					]}
				>
					Hi {profileData?.firstName}!
				</Text>
			</View>
			<View tw="my-2">
				<Text
					tw={[
						'font-inter text-sm',
						Platform.OS === 'web' ? 'text-black' : 'text-white',
					]}
				>
					{`You have access to ${projects?.length} opportunities`}
				</Text>
			</View>
		</View>
	);
};

export default function ProjectScrollListInfinite() {
	const {
		data: projects,
		fetchMore,
		refresh,
		isRefreshing,
		isLoadingMore,
		isLoading,
	} = useProjectFeed();
	const isDark = useIsDarkMode();
	const bottomBarHeight = usePlatformBottomHeight();
	const headerHeight = useHeaderHeight();
	const { height: windowHeight } = useWindowDimensions();
	const listRef = useRef<any>();
	useScrollToTop(listRef);

	const renderItem = useCallback(
		({ item: project }: ListRenderItemInfo<Project>) => {
			return (
				<ProjectScreenCard
					item={project}
					projectUrl={getPath('project', {
						slug: project.slug,
					})}
				/>
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

	if (!isLoading && projects.length === 0) {
		return (
			<>
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
		<InfiniteScrollList<Project>
			useWindowScroll
			data={projects}
			ListHeaderComponent={ListHeader}
			// for blur header effect on iOS
			style={{
				height: Platform.select({
					default: windowHeight - bottomBarHeight,
					ios: windowHeight,
				}),
			}}
			contentContainerStyle={Platform.select({
				// ios: {
				// 	paddingTop: headerHeight,
				// 	paddingBottom: bottomBarHeight,
				// },
				// android: {
				// 	paddingBottom: bottomBarHeight,
				// },
				// default: {},
			})}
			// Todo: unity refresh control same as tab view
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
			estimatedItemSize={600}
		/>
	);
}
