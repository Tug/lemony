import { useProjectFeed } from '../../hooks/use-project-feed';
import getPath from '../../navigation/lib/get-path';
import { ProjectScreenCard } from '../project-screen-card';
import { ProjectScreenCardSkeleton } from '../project-screen-card/skeleton';
import { VideoConfigContext } from '@diversifiedfinance/app/context/video-config-context';
import { withViewabilityInfiniteScrollList } from '@diversifiedfinance/app/hocs/with-viewability-infinite-scroll-list';
import { useHeaderHeight } from '@diversifiedfinance/app/lib/react-navigation/elements';
import { useScrollToTop } from '@diversifiedfinance/app/lib/react-navigation/native';
import { InfiniteScrollList } from '@diversifiedfinance/design-system/infinite-scroll-list';
import { useSafeAreaFrame } from '@diversifiedfinance/design-system/safe-area';
import type { Project } from '@diversifiedfinance/types';
import React, { useCallback, useMemo, useRef } from 'react';
import { Dimensions, Platform, useWindowDimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('screen');

const ViewabilityInfiniteScrollList =
	withViewabilityInfiniteScrollList(InfiniteScrollList);

export type ProjectSwipeListProps = {
	initialScrollIndex?: number;
	bottomPadding?: number;
};

const ProjectSwipeList = ({
	initialScrollIndex = 0,
	bottomPadding = 0,
}: ProjectSwipeListProps) => {
	const { data } = useProjectFeed();
	const fetchMore = undefined;
	const refresh = undefined;
	const isRefreshing = false;
	const listRef = useRef<any>(null);
	const headerHeight = useHeaderHeight();
	useScrollToTop(listRef);
	const { height: safeAreaFrameHeight } = useSafeAreaFrame();
	const { height: windowHeight } = useWindowDimensions();
	const momentumScrollCallback = useRef(undefined);
	const setMomentumScrollCallback = useCallback((cb: any) => {
		momentumScrollCallback.current = cb;
	}, []);

	const itemHeight = Platform.select({
		web: windowHeight,
		android: safeAreaFrameHeight - headerHeight,
		default: screenHeight,
	});

	const renderItem = useCallback(
		({ item }: { item: Project }) => (
			<ProjectScreenCard
				key={`project-${item.id}`}
				item={item}
				{...{
					itemHeight,
					bottomPadding,
					setMomentumScrollCallback,
				}}
				projectUrl={getPath('project', {
					slug: item.slug,
				})}
			/>
		),
		[itemHeight, bottomPadding, setMomentumScrollCallback]
	);

	const videoConfig = useMemo(
		() => ({
			isMuted: true,
			useNativeControls: false,
			previewOnly: false,
		}),
		[]
	);

	const extendedState = useMemo(() => ({ bottomPadding }), [bottomPadding]);

	if (!data || data.length === 0) return <ProjectScreenCardSkeleton />;

	return (
		<VideoConfigContext.Provider value={videoConfig}>
			<ViewabilityInfiniteScrollList
				data={data}
				onEndReached={fetchMore}
				initialScrollIndex={initialScrollIndex}
				showsVerticalScrollIndicator={false}
				ref={listRef}
				onRefresh={refresh}
				extraData={extendedState}
				onMomentumScrollEnd={momentumScrollCallback.current}
				refreshing={isRefreshing}
				pagingEnabled
				renderItem={renderItem}
				estimatedItemSize={itemHeight}
			/>
		</VideoConfigContext.Provider>
	);
};

export default ProjectSwipeList;
