import { defaultFilters } from '../../hooks/api-hooks';
import { useContentWidth } from '../../hooks/use-content-width';
import { useTabState } from '../../hooks/use-tab-state';
import { useHeaderHeight } from '../../lib/react-navigation/elements';
import { createParam } from '../../navigation/lib/use-param';
import { ProjectTabList, ProjectTabListRef } from './project-tab-list';
import { ProjectTop } from './project-top';
import { DEFAULT_HEADER_HEIGHT } from '@diversifiedfinance/app/components/header';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import {
	SceneRendererProps,
	HeaderTabView,
	Route,
	ScollableAutoWidthTabBar,
	NavigationState,
} from '@diversifiedfinance/design-system/tab-view';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { Project } from '@diversifiedfinance/types';
import React, { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import Animated from 'react-native-reanimated';

type Filter = typeof defaultFilters;
const { useParam } = createParam();

export interface TabbedProjectProps {
	project: Project;
	animationHeaderPosition?: Animated.SharedValue<number>;
	animationHeaderHeight?: Animated.SharedValue<number>;
	isRefreshing: boolean;
	refresh: () => void;
}

function TabbedProject({
	project,
	animationHeaderPosition,
	animationHeaderHeight,
	isRefreshing: isProjectRefreshing,
	refresh,
}: TabbedProjectProps): React.ReactElement {
	const isDark = useIsDarkMode();
	const isError = false;
	const isLoading = false;
	const contentWidth = useContentWidth();

	const tabsBlock = project.content.find(
		({ blockName }) => blockName === 'plethoraplugins/tabs'
	);

	const routes: Route[] = tabsBlock?.attrs.tabLabels?.map(
		(label: string, index: number) => ({
			key: `${label.toLowerCase().replaceAll(/[^a-zA-Z\d:]/g, '-')}`,
			title: label.replace(/^\S/, (s) => s.toUpperCase()),
			index,
		})
	);

	const {
		index,
		setIndex,
		setIsRefreshing,
		isRefreshing,
		currentTab,
		tabRefs,
	} = useTabState<ProjectTabListRef, Route>(routes, {
		defaultIndex: 0,
	});

	const { top } = useSafeAreaInsets();
	const headerHeight = useHeaderHeight();

	const onStartRefresh = useCallback(async () => {
		setIsRefreshing(true);
		refresh();
		// Todo: use async/await.
		currentTab?.refresh();
		// eslint-disable-next-line @diversifiedfinance/react-no-unsafe-timeout
		setTimeout(() => {
			setIsRefreshing(false);
		}, 1000);
	}, [
		currentTab,
		// mutate,
		setIsRefreshing,
	]);

	// TODO NEXT: push as new route instead of refreshing current one
	useEffect(() => {
		if (project.slug) {
			setIndex(0);
			onStartRefresh();
		}
	}, [project.slug]);

	const renderScene = useCallback(
		({
			route: { index: routeIndex },
		}: SceneRendererProps & {
			route: Route;
		}) => {
			return (
				<ProjectTabList
					index={routeIndex}
					project={project}
					ref={(ref) => (tabRefs.current[routeIndex] = ref)}
				/>
			);
		},
		[project, tabRefs]
	);

	const renderHeader = useCallback(() => {
		return (
			<View tw="items-center bg-white dark:bg-black">
				<View tw="w-full max-w-screen-xl">
					{Platform.OS === 'ios' && (
						<View style={{ height: headerHeight }} />
					)}
					<ProjectTop
						project={project}
						animationHeaderPosition={animationHeaderPosition}
					/>
				</View>
			</View>
		);
	}, [headerHeight, project]);

	const renderTabBar = useCallback(
		(
			props: SceneRendererProps & {
				navigationState: NavigationState<Route>;
			}
		) => (
			<View tw="dark:shadow-dark shadow-light bg-white dark:bg-black">
				<View tw="mx-auto w-full max-w-screen-xl">
					<ScollableAutoWidthTabBar {...props} />
				</View>
			</View>
		),
		[]
	);

	return (
		<HeaderTabView
			onStartRefresh={onStartRefresh}
			isRefreshing={isRefreshing}
			navigationState={{ index, routes }}
			renderScene={renderScene}
			onIndexChange={setIndex}
			renderScrollHeader={renderHeader}
			minHeaderHeight={Platform.select({
				default: 0,
				web: headerHeight,
			})}
			refreshControlTop={Platform.select({
				ios: headerHeight ? headerHeight : 20,
				default: 0,
			})}
			refreshHeight={top + DEFAULT_HEADER_HEIGHT}
			initialLayout={{
				width: contentWidth,
			}}
			emptyBodyComponent={<Text>empty body error</Text>}
			animationHeaderPosition={animationHeaderPosition}
			animationHeaderHeight={animationHeaderHeight}
			renderTabBar={renderTabBar}
		/>
	);
}

export default TabbedProject;
