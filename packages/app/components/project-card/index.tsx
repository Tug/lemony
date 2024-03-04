import {
	useNavigateToModalScreen,
	useNavigateToProject,
	useNavigateToScreen,
} from '../../navigation/lib/use-navigate-to';
import { useFirstProjectImage } from '@diversifiedfinance/app/hooks/use-wordpress-image';
import { Button, Image } from '@diversifiedfinance/design-system';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { Project } from '@diversifiedfinance/types';
import React from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import {
	isProjectCompleted,
	isProjectOngoing,
} from '@diversifiedfinance/app/utilities';
import { useTranslation } from 'react-i18next';
import { CircularProgress } from '@diversifiedfinance/components/circular-progress';
import { colors, TW } from '@diversifiedfinance/design-system/tailwind';
import ArrowRight from '@diversifiedfinance/design-system/icon/ArrowRight';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { APRBadge } from '@diversifiedfinance/app/components/apr-badge';
import { Divider } from '@diversifiedfinance/design-system/divider';
import { VipHeader } from '@diversifiedfinance/app/components/project-card/vip-header';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Analytics } from '@diversifiedfinance/app/lib/analytics';
import { useFeature } from '@growthbook/growthbook-react';
import { useBankAccounts } from '@diversifiedfinance/app/hooks/api-hooks';
import { PresaleBadge } from '@diversifiedfinance/app/components/presale-badge';
import Lock from '@diversifiedfinance/design-system/icon/Lock';
import { ResizeMode } from 'expo-av';

export interface ProjectCardProps {
	item: Project;
	itemHeight?: number;
	itemWidth?: number;
	disabled: boolean;
	showExtraInformation?: boolean;
	inCarousel?: boolean;
	isVIP?: boolean;
	style?: StyleProp<ViewStyle>;
	tw: TW;
}

export function ProjectCardSmall({
	item,
	itemHeight,
	disabled = false,
	inCarousel = false,
	tw = '',
	style,
}: ProjectCardProps) {
	const { t } = useTranslation();
	const [firstImage] = useFirstProjectImage(item);
	const navigateToProject = useNavigateToProject();
	const openModal = useNavigateToModalScreen();
	const { data: bankAccounts, isLoading: isBankAccountLoading } =
		useBankAccounts(false);
	const hasBankAccount = bankAccounts && bankAccounts.length > 0;
	const shouldCompleteIBAN = isBankAccountLoading || !hasBankAccount;
	const isLocked =
		Platform.OS !== 'web' && item.isPresale && shouldCompleteIBAN;

	const onProjectPress = () => {
		Analytics.track(Analytics.events.BUTTON_CLICKED, {
			target: 'card',
			type: 'projectCardSmall',
			name: 'View Project',
			projectSlug: item.slug,
			isLocked,
		});
		if (isLocked) {
			openModal('addBankAccount', { action: 'unlock' });
		} else {
			navigateToProject(item);
		}
	};

	return (
		<View tw={inCarousel ? 'pl-4' : ''}>
			<TouchableOpacity disabled={disabled} onPress={onProjectPress}>
				<View
					tw={[
						'w-40 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-900',
						tw,
					]}
					style={{
						...(itemHeight && { height: itemHeight }),
						...style,
					}}
					dataset={Platform.select({
						web: { testId: 'project-card-small' },
					})}
				>
					<View tw="w-full h-full flex-col items-stretch overflow-hidden p-4">
						<View tw="w-full">
							<View tw="mx-auto w-16 h-16">
								<Image
									style={{ width: '100%', height: '100%' }}
									resizeMode={ResizeMode.CONTAIN}
									source={{ uri: firstImage?.source_url }}
									alt="Project image"
								/>
							</View>
							{isProjectCompleted(item) && (
								<View tw="absolute bottom-[-4px] left-0 right-0 items-center">
									<View tw="bg-[#FF4405] rounded-full p-1">
										<Text tw="text-xs font-semibold text-white">
											{t('Completed')}
										</Text>
									</View>
								</View>
							)}
						</View>
						<View tw="mt-4 shrink grow flex-col">
							<View tw="">
								<Text tw="text-center text-sm font-bold text-black dark:text-white">
									{item.title}
								</Text>
							</View>
						</View>
					</View>
				</View>
			</TouchableOpacity>
		</View>
	);
}

export function ProjectCardBase({
	item,
	itemHeight = 400,
	itemWidth,
	disabled = false,
	inCarousel = false,
	showProgress = true,
	isVIP = false,
}: ProjectCardProps) {
	const { t } = useTranslation();
	const isDark = useIsDarkMode();
	const navigateToProject = useNavigateToProject();
	const openModal = useNavigateToModalScreen();
	const [firstImage, slideshowAttr] = useFirstProjectImage(item);
	const percentLeft = 100 - item.percent;
	const percentProgress = percentLeft / 100;
	const isOngoing = isProjectOngoing(item);
	const backgroundOnImage = useFeature('project-card-background-on-image').on;
	const { data: bankAccounts, isLoading: isBankAccountLoading } =
		useBankAccounts(false);
	const hasBankAccount = bankAccounts && bankAccounts.length > 0;
	const shouldCompleteIBAN = isBankAccountLoading || !hasBankAccount;
	const isLocked =
		Platform.OS !== 'web' && item.isPresale && shouldCompleteIBAN;

	const onProjectPress = (target?: string) => {
		Analytics.track(Analytics.events.BUTTON_CLICKED, {
			target,
			type: 'projectCardBase',
			name: 'View Project',
			projectSlug: item.slug,
		});
		if (isLocked) {
			openModal('addBankAccount', { action: 'unlock' });
		} else {
			navigateToProject(item);
		}
	};

	return (
		<View
			tw={inCarousel ? 'py-4 pl-4' : 'py-4 w-full'}
			style={{ width: itemWidth }}
		>
			<View tw="w-full">
				{isVIP && <VipHeader />}
				<View
					tw={[
						'w-full flex-col items-stretch justify-end bg-white dark:bg-gray-900 overflow-hidden',
						isVIP
							? 'border-themeYellow dark:border-themeOrange border-2 rounded-b-2xl'
							: 'rounded-2xl',
					]}
					style={{ height: itemHeight }}
				>
					<View tw="shrink grow basis-0 overflow-hidden">
						<TouchableOpacity
							onPress={() => onProjectPress('image')}
							style={{
								width: '100%',
								height: '100%',
							}}
							containerStyle={{
								width: '100%',
								height: '100%',
							}}
						>
							{backgroundOnImage &&
								!slideshowAttr?.className?.includes(
									'no-background'
								) && (
									<Image
										resizeMode="cover"
										style={{
											zIndex: -1,
											position: 'absolute',
											width: '100%',
											height: '100%',
											opacity: isDark ? 0.1 : 1,
										}}
										source={require('./Template_visuel_divisified.webp')}
										alt={t('Project image background')}
									/>
								)}
							<Image
								resizeMode="contain"
								style={{
									width: '100%',
									height: '100%',
								}}
								source={{ uri: firstImage?.source_url }}
								alt={t('Project image')}
							/>
						</TouchableOpacity>
						<APRBadge
							tw="absolute top-4 right-4 z-10"
							value={
								item.computedAPR > 0
									? item.computedAPR
									: item.expectedAPR
							}
						/>
					</View>
					<View tw="flex-col p-4">
						<View tw="my-1 flex-row items-center w-full">
							{item.isPresale && <PresaleBadge />}
							<View tw="grow shrink">
								<Text tw="text-base font-bold text-black dark:text-white">
									{item.title}
								</Text>
							</View>
						</View>
						{showProgress && (
							<>
								<Divider tw="mt-4 mb-2 bg-gray-200 dark:bg-gray-700" />
								<View tw="m-2 flex-col justify-center">
									<View tw="flex-row items-center gap-x-2 justify-start">
										<CircularProgress
											size={36}
											strokeBgColor={
												isDark
													? colors.gray[700]
													: colors.gray[100]
											}
											strokeColor={
												isDark
													? colors.gray[100]
													: colors.diversifiedBlue
											}
											strokeWidth={6}
											progress={percentProgress}
											strokeLinecap="round"
										></CircularProgress>
										<View tw="my-1">
											<Text tw="text-base font-bold text-diversifiedBlue dark:text-gray-100">{`${percentLeft.toFixed(
												0
											)}%`}</Text>
										</View>
										<View tw="my-1">
											<Text tw="text-xs text-diversifiedBlue dark:text-white">
												{t('Left for sale')}
											</Text>
										</View>
									</View>
								</View>
							</>
						)}

						<View tw="mt-3">
							{isLocked ? (
								<Button
									size={Platform.select({
										web: 'regular',
										default: 'small',
									})}
									variant="primary"
									theme="light"
									onPress={() => onProjectPress('button')}
									disabled={disabled}
								>
									<Lock style={{ marginRight: 5 }} />
									<Text
										tw={[
											'font-semibold',
											Platform.select({
												web: 'text-base',
												default: 'text-sm',
											}),
										]}
									>
										{t('Unlock Opportunity')}
									</Text>
								</Button>
							) : (
								<Button
									size={Platform.select({
										web: 'regular',
										default: 'small',
									})}
									variant="primary"
									theme="light"
									onPress={() => onProjectPress('button')}
									disabled={disabled}
								>
									<Text
										tw={[
											'font-semibold',
											Platform.select({
												web: 'text-base',
												default: 'text-sm',
											}),
										]}
									>
										{isOngoing
											? t('See Opportunity')
											: t('Learn More')}
									</Text>
									<ArrowRight style={{ marginLeft: 5 }} />
								</Button>
							)}
						</View>
					</View>
				</View>
			</View>
		</View>
	);
}
