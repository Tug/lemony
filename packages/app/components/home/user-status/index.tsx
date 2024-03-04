import { Button, Text, View } from '@diversifiedfinance/design-system';
import React, { useCallback } from 'react';
import { UserXPBadge } from '@diversifiedfinance/app/components/user-xp-badge';
import { CircularProgress } from '@diversifiedfinance/components/circular-progress';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { Crown } from '@diversifiedfinance/design-system/icon';
import { Divider } from '@diversifiedfinance/design-system/divider';
import { useTranslation } from 'react-i18next';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { useVIPUserLevel } from '@diversifiedfinance/app/hooks/use-vip-user-level';
import { Analytics } from '@diversifiedfinance/app/lib/analytics';

export function UserStatus() {
	const { i18n, t } = useTranslation();
	const redirectTo = useNavigateToScreen();
	const isDark = useIsDarkMode();
	const {
		isCustomer,
		currentLevelLabel,
		currentLevelColor,
		nextLevelLabel,
		nextLevelColor,
		nextLevelProgress,
		remainingXP,
	} = useVIPUserLevel();

	const onExploreVIPPress = useCallback(() => {
		Analytics.track(Analytics.events.BUTTON_CLICKED, {
			name: 'Explore VIP Privileges',
		});
		redirectTo('vipProgram');
	}, [redirectTo]);

	if (!isCustomer) {
		return null;
	}

	return (
		<View tw="flex-row bg-white dark:bg-gray-900 p-5 items-stretch rounded-2xl mb-6">
			<View tw="items-center">
				<View tw="mb-2">
					<Text tw="font-bold text-sm text-black dark:text-white">
						{t('My status')}
					</Text>
				</View>
				<View tw="mt-3 w-20">
					<CircularProgress
						size={78}
						strokeColor={currentLevelColor}
						strokeBgColor={
							isDark ? colors.gray[800] : colors.gray[100]
						}
						bgColor={colors.themeYellow}
						strokeWidth={6}
						progress={nextLevelProgress}
						strokeLinecap="round"
					>
						<View tw="items-center">
							<Crown
								width={37}
								height={24}
								color={isDark ? colors.black : colors.white}
							/>
						</View>
					</CircularProgress>
					<View tw="absolute -top-1 right-0 left-0 items-center">
						<View
							tw="items-center justify-center rounded-full py-1.5 px-2"
							style={{ backgroundColor: currentLevelColor }}
						>
							<Text tw="text-xs font-medium text-white dark:text:black">
								{currentLevelLabel.toUpperCase()}
							</Text>
						</View>
					</View>
				</View>
				<View tw="mt-2">
					<View tw="rounded-full mb-1 py-1 px-2 border border-gray-200 dark:border-gray-600 dark:bg-white">
						<UserXPBadge />
					</View>
				</View>
			</View>
			<Divider tw="mx-4" height="100%" orientation="vertical" />
			<View tw="flex-col items-start justify-between grow shrink">
				<View tw="mb-2">
					<Text tw="font-bold text-sm text-black dark:text-white">
						{t('Next status')}
					</Text>
				</View>
				<View tw="flex-row">
					<View tw="grow shrink">
						<View tw="my-1">
							<Text tw="font-semibold text-xs text-black dark:text-white">
								{t('{{points}} points', {
									points: new Intl.NumberFormat(
										i18n.language,
										{
											maximumFractionDigits: 0,
										}
									).format(remainingXP),
								})}
							</Text>
						</View>
						<View tw="mt-1 mb-2">
							<Text tw="text-xs text-black dark:text-white">
								{t('remaining before you reach {{nextLevel}}', {
									nextLevel: nextLevelLabel.toUpperCase(),
								})}
							</Text>
						</View>
					</View>
					<View>
						<CircularProgress
							size={42}
							strokeColor={nextLevelColor}
							strokeBgColor={
								isDark ? colors.gray[800] : colors.gray[100]
							}
							bgColor={colors.themeYellow}
							strokeWidth={2}
							progress={0}
							strokeLinecap="round"
						>
							<View tw="items-center">
								<Crown
									width={20}
									height={13}
									color={isDark ? colors.black : colors.white}
								/>
							</View>
						</CircularProgress>
						<View tw="absolute -top-2 -right-2 -left-2 items-center">
							<View
								tw="items-center justify-center rounded-full py-1 px-1.5"
								style={{ backgroundColor: nextLevelColor }}
							>
								<Text tw="text-xs font-medium text-white">
									{nextLevelLabel.toUpperCase()}
								</Text>
							</View>
						</View>
					</View>
				</View>

				<View tw="mb-1">
					<Button theme="light" onPress={onExploreVIPPress}>
						{t('Explore VIP Privileges')}
					</Button>
				</View>
			</View>
		</View>
	);
}
