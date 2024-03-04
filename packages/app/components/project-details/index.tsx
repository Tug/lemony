import { ProjectTop } from './project-top';
import TabbedProject from './tabbed-project';
import {
	Header,
	HeaderLeft,
	DEFAULT_HEADER_HEIGHT,
} from '@diversifiedfinance/app/components/header';
import {
	Button,
	ScrollView,
	Text,
	View,
} from '@diversifiedfinance/design-system';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import ArrowRight from '@diversifiedfinance/design-system/icon/ArrowRight';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { Project } from '@diversifiedfinance/types';
import React, { useMemo } from 'react';
import { LayoutChangeEvent, Platform } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { ProjectContext } from '@diversifiedfinance/app/context/project-context';
import { VideoConfigContext } from '@diversifiedfinance/app/context/video-config-context';
import { useTranslation } from 'react-i18next';
import {
	useNavigateToModalScreen,
	useNavigateToScreen,
} from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { Analytics, EVENTS } from '@diversifiedfinance/app/lib/analytics';
import { renderBlocks } from './render-blocks';
import {
	isExclusiveVIPProject,
	isProjectOngoing,
	isProjectOngoingOrVip,
} from '@diversifiedfinance/app/utilities';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { useFeature } from '@growthbook/growthbook-react';
import { ShareButton } from '@diversifiedfinance/app/components/share-button';
import { getAPIUrl } from '@diversifiedfinance/app/lib/get-api-url';
import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import Lock from '@diversifiedfinance/design-system/icon/Lock';
import { useBankAccounts } from '@diversifiedfinance/app/hooks/api-hooks';

function ProjectDetailsView({
	item,
	isRefreshing,
	refresh,
}: {
	item: Project;
	isRefreshing: boolean;
	refresh: () => void;
}): React.ReactElement {
	const animationHeaderPosition = useSharedValue(0);
	const { top } = useSafeAreaInsets();
	const { user } = useUser();
	const isUserVIP = user?.data.profile.labels?.find((label) =>
		label.startsWith('vip')
	);
	const isDark = useIsDarkMode();
	const { t } = useTranslation();
	const navigateTo = useNavigateToScreen();
	const handleBuyButtonPress = () => {
		Analytics.track(EVENTS.BUTTON_CLICKED, {
			name: 'checkout',
			projectSlug: item.slug,
		});
		navigateTo('checkout', { slug: item.slug }, { checkoutModal: true });
	};
	const tabsBlock = item.content.find(
		({ blockName }) => blockName === 'plethoraplugins/tabs'
	);
	const isScrollOnProject = useFeature('scroll-on-project').on;

	const isOngoing = isProjectOngoing(item);
	const isVIP = isUserVIP && isExclusiveVIPProject(item);

	const videoConfig = useMemo(
		() => ({
			isMuted: false,
			useNativeControls: true,
			previewOnly: false,
		}),
		[]
	);
	const projectUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${getPath(
		'project',
		{ slug: item.slug }
	)}`;
	const shareMessage = t(
		'Check out this project on Diversified Finance {{- url}}',
		{ url: projectUrl }
	);
	const openModal = useNavigateToModalScreen();
	const { data: bankAccounts, isLoading: isBankAccountLoading } =
		useBankAccounts(false);
	const hasBankAccount = bankAccounts && bankAccounts.length > 0;
	const shouldCompleteIBAN = isBankAccountLoading || !hasBankAccount;
	const isLocked = item.isPresale && shouldCompleteIBAN;

	return (
		<VideoConfigContext.Provider value={videoConfig}>
			<ProjectContext.Provider value={{ project: item }}>
				<View
					tw={[
						'w-full max-w-2xl flex-1 max-w-screen-xl bg-white dark:bg-black space-x-px px-0 md:space-x-6 md:px-4 lg:space-x-8',
					]}
				>
					{Platform.OS === 'web' ? (
						<View tw="mb-4 mt-16 flex justify-center">
							<Text tw="font-poppins-semibold text-center text-2xl font-bold dark:text-white">
								{item.title}
							</Text>
						</View>
					) : (
						<>
							<Header
								headerLeft={
									<HeaderLeft
										canGoBack={true}
										withBackground
									/>
								}
								headerCenter={
									<View tw="flex h-full justify-center">
										<Text tw="font-inter text-center font-bold dark:text-white">
											{item.title}
										</Text>
									</View>
								}
								headerRight={
									<ShareButton
										message={shareMessage}
										url={projectUrl}
									/>
								}
								withBackground
								translateYValue={animationHeaderPosition}
								// disableCenterAnimation
								color={isDark ? colors.gray[900] : colors.white}
							/>
							<View
								tw="mx-16 flex justify-center"
								style={{
									marginTop: top,
									height: DEFAULT_HEADER_HEIGHT,
								}}
							>
								<Text tw="font-inter text-center font-bold dark:text-white">
									{item.title}
								</Text>
							</View>
						</>
					)}
					{!tabsBlock || isScrollOnProject ? (
						<ScrollView>
							<ProjectTop
								project={item}
								animationHeaderPosition={
									animationHeaderPosition
								}
								isRefreshing={isRefreshing}
								refresh={refresh}
							/>
							<View tw="mx-4 pb-12">
								{renderBlocks(
									item.content.filter(
										({ blockName }) =>
											blockName !== 'jetpack/slideshow'
									)
								)}
							</View>
						</ScrollView>
					) : (
						<TabbedProject
							project={item}
							animationHeaderPosition={animationHeaderPosition}
							isRefreshing={isRefreshing}
							refresh={refresh}
						/>
					)}
				</View>
				{(isOngoing || isVIP) && (
					<View tw="absolute bottom-10 left-0 right-0 px-4">
						{isLocked ? (
							<Button
								size="regular"
								tw="m-1"
								onPress={() =>
									openModal('addBankAccount', {
										action: 'unlock',
									})
								}
							>
								<Lock style={{ marginRight: 5 }} />
								<Text tw="text-base font-semibold">
									{t('Unlock Opportunity')}
								</Text>
							</Button>
						) : (
							<Button
								size="regular"
								tw="m-1"
								onPress={handleBuyButtonPress}
							>
								<Text tw="text-base font-semibold">
									{item.isPresale
										? t('Buy on presale')
										: t('Invest in asset')}
								</Text>
								<ArrowRight style={{ marginLeft: 5 }} />
							</Button>
						)}
					</View>
				)}
			</ProjectContext.Provider>
		</VideoConfigContext.Provider>
	);
}

export default ProjectDetailsView;
