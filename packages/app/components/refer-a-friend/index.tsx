import React, { useCallback, useEffect } from 'react';
import {
	View,
	Text,
	Button,
	PressableScale,
	ScrollView,
} from '@diversifiedfinance/design-system';
import * as Clipboard from 'expo-clipboard';
import { TextLink } from '@diversifiedfinance/app/navigation/link';
import { Input } from '@diversifiedfinance/design-system/input';
import { Trans, useTranslation } from 'react-i18next';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import Copy from '@diversifiedfinance/design-system/icon/Copy';
import { toast } from '@diversifiedfinance/design-system/toast';
import { Platform, Share } from 'react-native';
import { Analytics } from '@diversifiedfinance/app/lib/analytics';
import { createUserReferralLink } from '@diversifiedfinance/app/lib/branch';
import { useModalScreenContext } from '@diversifiedfinance/design-system/modal-screen';
import { useMyInfo } from '@diversifiedfinance/app/hooks/api-hooks';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { useVIPUserLevel } from '@diversifiedfinance/app/hooks/use-vip-user-level';

export interface ReferAFriendProps {}

export function ReferAFriend({}: ReferAFriendProps) {
	const { t } = useTranslation();
	const isDark = useIsDarkMode();
	const { data: user } = useMyInfo();
	const {
		benefits: { difiedPerReferral },
	} = useVIPUserLevel();
	const modalScreenContext = useModalScreenContext();
	const shareCode = async () => {
		if (!user?.data.profile || !user?.data.profile.referralCode) {
			return;
		}
		const res = await createUserReferralLink(user.data.profile);
		const inviteLink = res?.url;
		const message = t(
			'I use Diversified to co-invest in rare and profitable luxury ' +
				'products such as wine, whisky, watches, bags and works of art!\n' +
				'\n' +
				'Follow my invitation link and win your first share of an exclusive ' +
				'asset along with your first investment: {{- inviteLink}}',
			{ inviteLink }
		);
		if (Platform.OS === 'web') {
			await Clipboard.setStringAsync(message);
			Analytics.track(Analytics.events.USER_SHARED_INVITE, {
				activityType: 'clipboard',
			});
			toast.success(t('Invite code copied to clipboard!'));
			return;
		}
		try {
			const result = await Share.share({
				message,
			});
			if (result.action === Share.sharedAction) {
				Analytics.track(Analytics.events.USER_SHARED_INVITE, {
					activityType: result.activityType,
				});
			} else if (result.action === Share.dismissedAction) {
				Analytics.track(Analytics.events.USER_DISMISSED, {
					name: 'Share Invite',
				});
			}
		} catch (error) {
			if (__DEV__) {
				console.error(error);
			}
		}
	};

	const copyCode = useCallback(async () => {
		if (!user?.data.profile.referralCode) {
			return;
		}
		await Clipboard.setStringAsync(user.data.profile.referralCode);
		Analytics.track(Analytics.events.BUTTON_CLICKED, {
			name: 'Copy referral code',
		});
		toast.success(t('Invite code copied to clipboard!'));
	}, [t, user?.data.profile.referralCode]);

	useEffect(() => {
		modalScreenContext?.setTitle(
			t('Receive {{count}} DIFIED', { count: difiedPerReferral })
		);
	}, [modalScreenContext?.setTitle, t]);

	return (
		<ScrollView tw="p-4">
			<View tw="mb-5 flex-row">
				<View tw="bg-diversifiedBlue basis-1/2 flex-col rounded-2xl p-5">
					<View tw="mb-2">
						<Text tw="text-lg font-bold text-white">
							{t('Refer a friend and win')}
						</Text>
					</View>
					<View tw="my-2 grow items-center justify-center">
						<Text tw="text-3xl font-bold text-white">
							{t('{{count}} DIFIED', {
								count: difiedPerReferral,
							})}
						</Text>
					</View>
				</View>
				<View tw="basis-1/2 py-4 pl-4 pr-2">
					<View tw="mb-2">
						<Text tw="text-sm text-black dark:text-white">
							{
								<Trans t={t}>
									Refer your friends and win{' '}
									{{ difiedPerReferral }} DIFIED for each
									person who invest on Diversified. Your
									friends also get 1 DIFIED upon their first
									investment.
								</Trans>
							}
						</Text>
					</View>
					<View tw="mb-2">
						<TextLink
							tw="text-xs font-bold underline text-black dark:text-white"
							href={t(
								'https://www.diversified.fi/en-us/afiliation'
							)}
						>
							{t('Learn more')}
						</TextLink>
					</View>
				</View>
			</View>
			<View tw="mb-6">
				<View tw="mb-4 mt-2">
					<Text tw="text-base font-bold text-black dark:text-white">
						{t('My referral code:')}
					</Text>
				</View>
				<PressableScale onPress={copyCode}>
					<Input
						tw="text-center text-black dark:text-white"
						disabled
						value={user?.data.profile.referralCode}
						rightElement={
							<View tw="mx-4">
								<Copy
									width={24}
									height={24}
									color={isDark ? colors.white : colors.black}
								/>
							</View>
						}
					/>
				</PressableScale>
			</View>
			<View tw="mb-5">
				<Button variant="primary" size="regular" onPress={shareCode}>
					{t('Share my code')}
				</Button>
			</View>
		</ScrollView>
	);
}
