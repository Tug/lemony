import React, { useCallback, useEffect } from 'react';
import { View, Text, Button } from '@diversifiedfinance/design-system';
import { printMoney } from '@diversifiedfinance/app/lib/money';
import { TextLink } from '@diversifiedfinance/app/navigation/link';
import { Trans, useTranslation } from 'react-i18next';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { useModalScreenContext } from '@diversifiedfinance/design-system/modal-screen';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import Screen from '@diversifiedfinance/app/components/screen';
import VIPVisual from './vip-visual.svg';
import VIPCalc from './vip-calc.svg';
import { LevelIcon } from './level-icon';
import { LevelBadge } from './level-badge';
import CheckCircleOutlined from '@diversifiedfinance/design-system/icon/CheckCircleOutlined';
import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';

export function VIPProgram() {
	const { i18n, t } = useTranslation();
	const isDark = useIsDarkMode();
	const redirectTo = useNavigateToScreen();
	const modalScreenContext = useModalScreenContext();

	useEffect(() => {
		modalScreenContext?.setTitle(
			t('Receive {{amount}}', { amount: printMoney(10) })
		);
	}, [modalScreenContext?.setTitle, t]);

	return (
		<>
			<Screen>
				<View tw="pt-4 mb-24">
					<View tw="my-2">
						<Text tw="text-2xl text-black dark:text-white">
							{t(
								'We have designed our VIP programme to reward your purchases and your loyalty.'
							)}
						</Text>
					</View>
					<View tw="my-3">
						<Text tw="text-xl font-bold text-black dark:text-white">
							{t('How do I earn points?')}
						</Text>
					</View>
					<View tw="my-3">
						<View tw="mb-4">
							<Text tw="text-sm text-black dark:text-white">
								{t('You can earn points in a number of ways:')}
							</Text>
						</View>
						<View tw="mb-3">
							<Text tw="text-sm text-black dark:text-white">
								{`\u2022 `}
								{t(
									'By investing in our assets available for sale or resale.'
								)}{' '}
								<TextLink
									tw="text-sm font-bold underline underline-offset-2"
									href={getPath('project', {
										slug: 'ongoing',
									})}
								>
									{t('See the assets')}
								</TextLink>
							</Text>
						</View>
						<View tw="mb-2">
							<Text tw="text-sm text-black dark:text-white">
								{`\u2022 `}
								{t(
									'By referring your friends to Diversified.'
								)}{' '}
								<TextLink
									tw="text-sm font-bold underline underline-offset-2"
									href={getPath('referAFriend')}
								>
									{t('Share my referral code')}
								</TextLink>
							</Text>
						</View>
					</View>
					<View tw="my-1 rounded-2xl bg-white dark:bg-gray-900 items-center p-4">
						<VIPVisual />
					</View>
					<View tw="my-4">
						<Text tw="text-xl font-bold text-black dark:text-white">
							{t('How do you count the points?')}
						</Text>
					</View>
					<View tw="my-1">
						<Text tw="text-sm text-black dark:text-white">
							{t(
								'Every Euro spent on Diversified helps you progress. And the more friends you invite who invest on the platform, the more points points you earn.'
							)}
						</Text>
					</View>
					<View tw="my-4 rounded-2xl bg-white dark:bg-gray-900 py-4 pr-2">
						<View tw="flex-row items-center">
							<View tw="w-1 bg-diversifiedBlue dark:bg-themeYellow h-full rounded-r-lg"></View>
							<View tw="mx-4">
								<VIPCalc />
							</View>
							<View tw="grow">
								<View tw="my-1 flex-row">
									<Text tw="text-sm text-black dark:text-white">
										{t('1 DIFIED purchased')}
										{' = '}
									</Text>
									<Text tw="text-sm font-bold text-themeOrange dark:text-white">
										{t('{{amount}} pts', {
											amount: new Intl.NumberFormat(
												i18n.language,
												{
													maximumFractionDigits: 0,
												}
											).format(100),
										})}
									</Text>
								</View>
								<View tw="my-1 flex-row">
									<Text tw="text-sm text-black dark:text-white">
										{t('1 Referral')}
										{' = '}
									</Text>
									<Text tw="text-sm font-bold text-themeOrange dark:text-white">
										{t('{{amount}} pts', {
											amount: new Intl.NumberFormat(
												i18n.language,
												{
													maximumFractionDigits: 0,
												}
											).format(1000),
										})}
									</Text>
								</View>
							</View>
						</View>
					</View>
					<View tw="my-4">
						<Text tw="text-xl font-bold text-black dark:text-white">
							{t('The different levels of the programme')}
						</Text>
					</View>
					<View tw="my-4 rounded-2xl bg-white dark:bg-gray-900 p-4">
						<View tw="flex-row items-center justify-between">
							<LevelIcon
								levelName={t('Regular')}
								color={colors.blueGray[400]}
							/>
							<LevelIcon
								levelName={t('VIP 1')}
								color={colors.diversifiedBlue}
							/>
							<LevelIcon
								levelName={t('VIP 2')}
								color={colors.themeOrange}
							/>
						</View>
					</View>
					<View tw="my-3">
						<View tw="mb-4">
							<Text tw="text-sm text-black dark:text-white">
								{t(
									'There are 3 levels in the VIP programme. Each level gives you access to exclusive benefits. To reach each level, you must meet the following conditions.'
								)}
							</Text>
						</View>
						<View tw="mb-3">
							<Text tw="text-sm text-black dark:text-white">
								{`\u2022 `}
								<Trans t={t}>
									<Text tw="text-sm font-bold text-black dark:text-white">
										Saver regular
									</Text>
									: from{' '}
									<Text tw="text-sm font-bold text-black dark:text-white">
										0 to 15,000 points
									</Text>
									.
								</Trans>
							</Text>
						</View>
						<View tw="mb-3">
							<Text tw="text-sm text-black dark:text-white">
								{`\u2022 `}
								<Trans t={t}>
									<Text tw="text-sm font-bold text-black dark:text-white">
										VIP 1
									</Text>
									: accumulate at least{' '}
									<Text tw="text-sm font-bold text-black dark:text-white">
										15,000 points
									</Text>
									.
								</Trans>
							</Text>
						</View>
						<View tw="mb-3">
							<Text tw="text-sm text-black dark:text-white">
								{`\u2022 `}
								<Trans t={t}>
									<Text tw="text-sm font-bold text-black dark:text-white">
										VIP 2
									</Text>
									: accumulate at least{' '}
									<Text tw="text-sm font-bold text-black dark:text-white">
										50,000 points
									</Text>
									.
								</Trans>
							</Text>
						</View>
					</View>
					<View tw="my-4 rounded-2xl bg-white dark:bg-gray-900 p-4">
						<View tw="flex-row items-center">
							<LevelBadge
								levelName={t('Regular')}
								color={colors.blueGray[400]}
							/>
							<View tw="shrink grow items-center mx-2">
								<Text tw="font-bold text-sm text-center text-black dark:text-white">
									{t(
										'From {{amountMin}} to {{amountMax}} pts',
										{
											amountMin: 0,
											amountMax: new Intl.NumberFormat(
												i18n.language,
												{
													maximumFractionDigits: 0,
												}
											).format(15000),
										}
									)}
								</Text>
							</View>
						</View>
						<View tw="mt-4 rounded-2xl bg-blueGray-100 dark:bg-gray-900 px-4 py-2">
							<View tw="my-1 flex-row">
								<View tw="mr-2">
									<CheckCircleOutlined
										color={
											isDark
												? colors.white
												: colors.diversifiedBlue
										}
									/>
								</View>
								<View tw="my-1 shrink">
									<Text tw="text-sm text-black dark:text-white">
										{t('Access to basic functionalities')}
									</Text>
								</View>
							</View>
							<View tw="my-1 flex-row">
								<View tw="mr-2">
									<CheckCircleOutlined
										color={
											isDark
												? colors.white
												: colors.diversifiedBlue
										}
									/>
								</View>
								<View tw="my-1 shrink">
									<Text tw="text-sm text-black dark:text-white">
										{t(
											'{{count}} DIFIED credits per referral',
											{ count: 1 }
										)}
									</Text>
								</View>
							</View>
						</View>
					</View>
					<View tw="my-4 rounded-2xl bg-white dark:bg-gray-900 p-4">
						<View tw="flex-row items-center justify-between">
							<LevelBadge
								levelName={t('VIP Level 1')}
								color={colors.diversifiedBlue}
							/>
							<View tw="shrink grow items-center mx-2">
								<Text tw="font-bold text-sm text-center text-black dark:text-white">
									{t('From {{count}} pts', {
										count: new Intl.NumberFormat(
											i18n.language,
											{
												maximumFractionDigits: 0,
											}
										).format(15000),
									})}
								</Text>
							</View>
						</View>
						<View tw="mt-4 rounded-2xl bg-blueGray-100 dark:bg-gray-900 px-4 py-2">
							<View tw="my-1 flex-row">
								<View tw="mr-2">
									<CheckCircleOutlined
										color={
											isDark
												? colors.white
												: colors.diversifiedBlue
										}
									/>
								</View>
								<View tw="my-1 shrink">
									<Text tw="text-sm text-black dark:text-white">
										{t('Access to basic functionalities')}
									</Text>
								</View>
							</View>
							<View tw="my-1 flex-row">
								<View tw="mr-2">
									<CheckCircleOutlined
										color={
											isDark
												? colors.white
												: colors.diversifiedBlue
										}
									/>
								</View>
								<View tw="my-1 shrink">
									<Text tw="text-sm text-black dark:text-white">
										{t(
											'Priority access to new opportunities'
										)}
									</Text>
								</View>
							</View>
							<View tw="my-1 flex-row">
								<View tw="mr-2">
									<CheckCircleOutlined
										color={
											isDark
												? colors.white
												: colors.diversifiedBlue
										}
									/>
								</View>
								<View tw="my-1 shrink">
									<Text tw="text-sm text-black dark:text-white">
										{t(
											'{{count}} DIFIED credits per referral',
											{ count: 2 }
										)}
									</Text>
								</View>
							</View>
						</View>
					</View>
					<View tw="my-4 rounded-2xl bg-white dark:bg-gray-900 p-4">
						<View tw="flex-row items-center justify-between">
							<View tw="mr-4">
								<LevelBadge
									levelName={t('VIP Level 2')}
									color={colors.themeOrange}
								/>
							</View>
							<View tw="shrink grow items-center mx-2">
								<Text tw="font-bold text-sm text-center text-black dark:text-white">
									{t('From {{count}} pts', {
										count: new Intl.NumberFormat(
											i18n.language,
											{
												maximumFractionDigits: 0,
											}
										).format(50000),
									})}
								</Text>
							</View>
						</View>
						<View tw="mt-4 rounded-2xl bg-blueGray-100 dark:bg-gray-900 px-4 py-2">
							<View tw="my-1 flex-row">
								<View tw="mr-2">
									<CheckCircleOutlined
										color={
											isDark
												? colors.white
												: colors.diversifiedBlue
										}
									/>
								</View>
								<View tw="my-1 shrink">
									<Text tw="text-sm text-black dark:text-white">
										{t('Access to basic functionalities')}
									</Text>
								</View>
							</View>
							<View tw="my-1 flex-row">
								<View tw="mr-2">
									<CheckCircleOutlined
										color={
											isDark
												? colors.white
												: colors.diversifiedBlue
										}
									/>
								</View>
								<View tw="my-1 shrink">
									<Text tw="text-sm text-black dark:text-white">
										{t('Access to VIP sales only')}
									</Text>
								</View>
							</View>
							<View tw="my-1 flex-row">
								<View tw="mr-2">
									<CheckCircleOutlined
										color={
											isDark
												? colors.white
												: colors.diversifiedBlue
										}
									/>
								</View>
								<View tw="my-1 shrink">
									<Text tw="text-sm text-black dark:text-white">
										{t(
											'{{count}} DIFIED credits per referral',
											{ count: 3 }
										)}
									</Text>
								</View>
							</View>
							<View tw="my-1 flex-row">
								<View tw="mr-2">
									<CheckCircleOutlined
										color={
											isDark
												? colors.white
												: colors.diversifiedBlue
										}
									/>
								</View>
								<View tw="my-1 shrink">
									<Text tw="text-sm text-black dark:text-white">
										{t(
											'Access to the private discussion group to co-construct Diversified'
										)}
									</Text>
								</View>
							</View>
							<View tw="my-1 flex-row">
								<View tw="mr-2">
									<CheckCircleOutlined
										color={
											isDark
												? colors.white
												: colors.diversifiedBlue
										}
									/>
								</View>
								<View tw="my-1 shrink">
									<Text tw="text-sm text-black dark:text-white">
										{t('Access to partner events')}
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>
			</Screen>
			<View tw="z-10 absolute bottom-12 left-0 right-0 px-4 flex-row items-stretch gap-x-1">
				<View tw="basis-1/2">
					<Button
						size="regular"
						onPress={() =>
							redirectTo('project', { slug: 'ongoing' })
						}
					>
						{t('Invest')}
					</Button>
				</View>
				<View tw="basis-1/2">
					<Button
						size="regular"
						variant="secondary"
						onPress={() => redirectTo('referAFriend')}
					>
						{t('Refer a friend')}
					</Button>
				</View>
			</View>
		</>
	);
}
