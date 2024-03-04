import { useProjectFeed } from '../../hooks/use-project-feed';
import getPath from '../../navigation/lib/get-path';
import { ProjectScreenCard } from '../project-screen-card';
import { ProjectScreenCardSkeleton } from '../project-screen-card/skeleton';
import {
	ItemKeyContext,
	ViewabilityItemsContext,
} from '@diversifiedfinance/app/components/viewability-tracker-flatlist';
import { VideoConfigContext } from '@diversifiedfinance/app/context/video-config-context';
import { useScrollToTop } from '@diversifiedfinance/app/lib/react-navigation/native';
import { createParam } from '@diversifiedfinance/app/navigation/lib/use-param';
import { isMobileWeb, isSafari } from '@diversifiedfinance/app/utilities';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { clamp } from '@diversifiedfinance/design-system/utils';
import { View } from '@diversifiedfinance/design-system/view';
import type { Project } from '@diversifiedfinance/types';
import React, {
	useCallback,
	useMemo,
	useRef,
	useEffect,
	createContext,
	useState,
} from 'react';
import { useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { Virtual, Keyboard } from 'swiper';
import type { Swiper as SwiperClass } from 'swiper';
import 'swiper/css';
import 'swiper/css/virtual';
import { Swiper, SwiperSlide } from 'swiper/react';

export type ProjectSwipeListProps = {
	initialScrollIndex?: number;
	bottomPadding?: number;
};
const { useParam } = createParam();

export const SwiperActiveIndexContext = createContext<number>(0);
const ProjectSwipeList = ({
	initialScrollIndex = 0,
	bottomPadding = 0,
}: ProjectSwipeListProps) => {
	const { data, isLoading } = useProjectFeed();
	const fetchMore = undefined;
	const router = useRouter();
	const [activeIndex, setActiveIndex] = useState(0);
	const listRef = useRef<any>(null);
	useScrollToTop(listRef);
	const initialURLSet = useRef(false);
	const [initialParamProp] = useParam('initialScrollIndex');
	const isSwipeListScreen = typeof initialParamProp !== 'undefined';
	const isSwiped = useRef(false);

	const visibleItems = useSharedValue<any[]>([
		undefined,
		initialScrollIndex,
		data?.length && initialScrollIndex + 1 < data.length
			? initialScrollIndex + 1
			: undefined,
	]);
	const { height: windowHeight, width: windowWidth } = useWindowDimensions();
	const videoConfig = useMemo(
		() => ({
			isMuted: true,
			useNativeControls: false,
			previewOnly: false,
		}),
		[]
	);

	useEffect(() => {
		if (
			!initialURLSet.current &&
			isSwipeListScreen &&
			typeof initialParamProp !== 'undefined'
		) {
			const project = data?.[Number(initialParamProp)];
			if (project) {
				window.history.replaceState(
					null,
					'',
					getPath('project', {
						slug: project.slug,
					})
				);
			}

			initialURLSet.current = true;
		}
	}, [data, isSwipeListScreen, initialParamProp]);

	const onRealIndexChange = useCallback(
		(e: SwiperClass) => {
			if (
				e.activeIndex !== 0 &&
				!isSwiped.current &&
				router.pathname === '/' &&
				isSafari()
			) {
				// change URL is for hide smart app banner on Safari when swipe once
				window.history.replaceState(null, '', 'feed');
				isSwiped.current = true;
			}
			visibleItems.value = [
				e.previousIndex,
				e.activeIndex,
				e.activeIndex + 1 < data.length ? e.activeIndex + 1 : undefined,
			];
			if (isSwipeListScreen) {
				window.history.replaceState(
					null,
					'',
					getPath('project', {
						slug: data[e.activeIndex]?.slug,
					})
				);
			}
			setActiveIndex(e.activeIndex);
		},
		[visibleItems, data, router, isSwipeListScreen]
	);

	if (!data || data.length === 0)
		return (
			<View
				testID="swipeList"
				id="slidelist"
				tw="fixed inset-0 h-screen overflow-hidden"
			>
				<ProjectScreenCardSkeleton />
			</View>
		);

	return (
		<View
			testID="swipeList"
			id="slidelist"
			tw="fixed inset-0 h-screen overflow-hidden"
		>
			<VideoConfigContext.Provider value={videoConfig}>
				<SwiperActiveIndexContext.Provider value={activeIndex}>
					<ViewabilityItemsContext.Provider value={visibleItems}>
						<Swiper
							modules={[Virtual, Keyboard]}
							height={windowHeight}
							width={windowWidth}
							keyboard
							initialSlide={clamp(
								initialScrollIndex,
								0,
								data.length - 1
							)}
							virtual
							direction="vertical"
							onRealIndexChange={onRealIndexChange}
							onReachEnd={fetchMore}
							threshold={isMobileWeb() ? 0 : 25}
							noSwiping
							noSwipingClass="swiper-no-swiping"
						>
							{data.map((item, index) => (
								<SwiperSlide key={item.id} virtualIndex={index}>
									<ItemKeyContext.Provider value={index}>
										<ProjectScreenCard
											item={item}
											projectUrl={getPath('project', {
												slug: item.slug,
											})}
											itemHeight={windowHeight}
										/>
									</ItemKeyContext.Provider>
								</SwiperSlide>
							))}
						</Swiper>
					</ViewabilityItemsContext.Provider>
				</SwiperActiveIndexContext.Provider>
			</VideoConfigContext.Provider>
		</View>
	);
};

export default ProjectSwipeList;
