import {
	useNavigateToModalScreen,
	useNavigateToProject,
} from '../../navigation/lib/use-navigate-to';
import { useFirstProjectImage } from '@diversifiedfinance/app/hooks/use-wordpress-image';
import {
	Button,
	Image,
	PressableScale,
} from '@diversifiedfinance/design-system';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { Project } from '@diversifiedfinance/types';
import React, { ReactNode, Fragment, useState } from 'react';
import { Platform } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { CircularProgress } from '@diversifiedfinance/components/circular-progress';
import { APRBadge } from '@diversifiedfinance/app/components/apr-badge';
import { Divider } from '@diversifiedfinance/design-system/divider';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { VipHeader } from '@diversifiedfinance/app/components/project-card/vip-header';
import { ArrowRight } from '@diversifiedfinance/design-system/icon';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { PresaleBadge } from '@diversifiedfinance/app/components/presale-badge';
import { useFeature } from '@growthbook/growthbook-react';
import { Analytics } from '@diversifiedfinance/app/lib/analytics';
import { useBankAccounts } from '@diversifiedfinance/app/hooks/api-hooks';

export interface ProjectRowProps {
	item: Project;
	labels?: ReactNode[];
	isVIP?: boolean;
}

export function ProjectRow({
	item,
	labels,
	isVIP = false,
}: ProjectRowProps): React.ReactElement {
	const isDark = useIsDarkMode();
	const { t } = useTranslation();
	const [firstImage, slideshowAttr] = useFirstProjectImage(item);
	const navigateToProject = useNavigateToProject();
	const percentLeft = 100 - item.percent;
	const percentProgress = percentLeft / 100;
	const aprPercent =
		item.computedAPR > 0 ? item.computedAPR : item.expectedAPR;
	const openModal = useNavigateToModalScreen();
	const backgroundOnImage = useFeature('project-card-background-on-image').on;
	const { data: bankAccounts, isLoading: isBankAccountLoading } =
		useBankAccounts(false);
	const hasBankAccount = bankAccounts && bankAccounts.length > 0;
	const shouldCompleteIBAN = isBankAccountLoading || !hasBankAccount;
	const isLocked = item.isPresale && shouldCompleteIBAN;

	const onProjectPress = () => {
		Analytics.track(Analytics.events.BUTTON_CLICKED, {
			target: 'card',
			type: 'projectRow',
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
		<TouchableOpacity onPress={onProjectPress}>
			<View tw="my-2">
				{isVIP && <VipHeader />}
				<View
					tw={[
						'bg-white dark:bg-gray-900',
						isVIP
							? 'border-themeYellow dark:border-themeOrange border-2 rounded-b-2xl'
							: 'rounded-2xl',
					]}
					dataset={Platform.select({
						web: { testId: 'project-row' },
					})}
				>
					<View tw="flex-row justify-items-stretch m-4 pb-2">
						<View tw="absolute h-6 top-[-28px] left-[10%] flex-row">
							{labels?.map((label, index) => (
								<Fragment key={index}>{label}</Fragment>
							))}
						</View>
						<View tw="flex-row mr-4 h-full items-center">
							<View tw="w-18 h-24 justify-center rounded-2xl overflow-hidden">
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
												height: 102,
												opacity: isDark ? 0.1 : 1,
											}}
											source={require('../project-card/Template_visuel_divisified.webp')}
											alt={t('Project image background')}
										/>
									)}
								<Image
									width={72}
									height={72}
									resizeMode="contain"
									source={{ uri: firstImage?.source_url }}
									alt="Project cover image"
									borderRadius={16}
								/>
							</View>
						</View>
						<View tw="shrink grow flex-col">
							{item.isPresale && (
								<View tw="flex-row mb-1">
									<PresaleBadge />
								</View>
							)}
							<View tw="my-2">
								<Text tw="text-base font-bold dark:text-white">
									{item.title}
								</Text>
							</View>
							<View tw="mt-2">
								<View tw="flex-row items-start justify-between">
									<APRBadge value={aprPercent} />
									<View tw="rounded-full bg-gray-100 dark:bg-gray-800 h-8 w-8 items-center justify-center -mb-2 -mr-1">
										<ArrowRight
											width={20}
											height={24}
											color={
												isDark
													? colors.gray[400]
													: colors.gray[600]
											}
										/>
									</View>
								</View>
								<Divider tw="my-3 bg-gray-200 dark:bg-gray-700" />
								<View tw="pl-1 flex-row items-center gap-x-2 justify-start">
									<CircularProgress
										size={28}
										strokeBgColor={
											isDark
												? colors.gray[700]
												: colors.gray[200]
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
									<View tw="flex-row gap-x-1 items-center">
										<View>
											<Text tw="text-base font-bold text-diversifiedBlue dark:text-gray-100">{`${percentLeft.toFixed(
												0
											)}%`}</Text>
										</View>
										<View>
											<Text tw="text-xs text-gray-600 dark:text-gray-400 font-bold">
												{t('Left for sale')}
											</Text>
										</View>
									</View>
								</View>
							</View>
						</View>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}
