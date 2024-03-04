import { useHeaderHeight } from '../../lib/react-navigation/elements';
import { useNavigateToProject } from '../../navigation/lib/use-navigate-to';
import {
	useFirstProjectImage,
	useWordPressImage,
} from '@diversifiedfinance/app/hooks/use-wordpress-image';
import { Link } from '@diversifiedfinance/app/navigation/link';
import RawHTML from '@diversifiedfinance/components/raw-html';
import { Image } from '@diversifiedfinance/design-system';
import { Button } from '@diversifiedfinance/design-system/button';
import ArrowRight from '@diversifiedfinance/design-system/icon/ArrowRight';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { Project } from '@diversifiedfinance/types';
import React, { useCallback, useMemo, useRef } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import CrowdfundingProgress from '../simple-metric-card/crowdfunding-progress';
import ProjectTrackingCard from '../simple-metric-card/project-tracking';
import ExpectedAPR from '../simple-metric-card/expected-apr';
import { usePrice } from '../../hooks/api-hooks';
import { ProjectContext } from '@diversifiedfinance/app/context/project-context';
import { useTranslation } from 'react-i18next';

export interface ProjectScreenCardProps {
	item: Project;
	projectUrl: string;
	itemHeight?: number;
}

export function ProjectScreenCard({
	item,
	itemHeight,
	projectUrl,
}: ProjectScreenCardProps): React.ReactElement {
	const { t } = useTranslation();
	const { slug, title, description, percent, content } = item;
	const navigateToProject = useNavigateToProject();
	const percentProgress = useSharedValue(item.percent / 100);
	const { isValidating: isPriceReloading, data: prices } = usePrice(
		item.tokenSymbol
	);

	const { width: windowWidth, height: windowHeight } = useWindowDimensions();
	// const bottomHeight = usePlatformBottomHeight();
	// const maxContentHeight = windowHeight - bottomHeight;
	const bottomHeight = 0;
	const maxWidthForImage = Math.min(windowWidth, 672) - 32;
	const maxContentHeight = windowHeight;

	const mediaHeight = useMemo(() => {
		const aspectRatio = 2;
		const actualHeight = maxWidthForImage / aspectRatio;

		if (actualHeight < windowHeight - bottomHeight) {
			return Math.min(actualHeight, maxContentHeight);
		}

		return windowHeight - bottomHeight;
	}, [bottomHeight, maxContentHeight, windowHeight, maxWidthForImage]);

	const handleOnPressUser = useCallback(() => {
		navigateToProject(item);
	}, [item, navigateToProject]);
	const [firstImage] = useFirstProjectImage(item);

	return (
		<ProjectContext.Provider value={{ project: item }}>
			<View
				dataset={Platform.select({ web: { testId: 'project-card' } })}
				tw={[
					'mx-auto rounded-2xl my-8 w-full max-w-xl flex-1 bg-white opacity-100 dark:bg-gray-900',
					itemHeight ? 'overflow-hidden' : '',
				]}
				style={itemHeight ? { height: itemHeight } : {}}
			>
				<View
					tw={[
						'w-full flex-col justify-around px-4',
						itemHeight ? 'h-full' : '',
					]}
					shouldRasterizeIOS={true}
				>
					<Link href={projectUrl}>
						<Image
							resizeMode="contain"
							style={{
								width: '100%',
								height: mediaHeight,
							}}
							source={{ uri: firstImage?.source_url }}
							alt={t('Project cover image')}
						/>
					</Link>
					<View tw="pb-2 pt-4">
						<Text tw="text-xl font-bold text-gray-900 dark:text-white">
							{title}
						</Text>
					</View>
					<View tw="my-2 max-h-32">
						<RawHTML tw="[&>p]:line-clamp-5">{description}</RawHTML>
					</View>
					<View tw="h-28 flex-row items-stretch justify-between">
						<ExpectedAPR
							value={
								item.computedAPR > 0
									? item.computedAPR
									: item.expectedAPR
							}
							data={prices}
							isLoading={isPriceReloading}
							tw="mr-2"
						/>
						<CrowdfundingProgress
							progress={item.percent}
							tw="ml-2 mr-2"
						/>
						<ProjectTrackingCard
							startDate={item.startOfCrowdfundingDate}
							endDate={item.endOfCrowdfundingDate}
							tw="ml-2"
						/>
					</View>
					<View tw="my-6">
						<Link href={projectUrl}>
							<Button size="regular" onPress={handleOnPressUser}>
								<Text tw="text-base font-semibold">
									{t('Learn more')}
								</Text>
								<ArrowRight style={{ marginLeft: 5 }} />
							</Button>
						</Link>
					</View>
				</View>
			</View>
		</ProjectContext.Provider>
	);
}
