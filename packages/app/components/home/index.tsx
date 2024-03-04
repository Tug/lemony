import { useProjectFeed } from '../../hooks/use-project-feed';
import { useUser } from '../../hooks/use-user';
import Screen from '@diversifiedfinance/app/components/screen';
import React, { useCallback, useEffect, useState } from 'react';
import { OngoingProjects } from './ongoing-projects';
import { NextProjects } from './next-projects';
import { CompletedProjects } from './completed-projects';
import { PresaleProjects } from './presale-projects';
import {
	useMyInfo,
	useMyTokenClaims,
} from '@diversifiedfinance/app/hooks/api-hooks';
import { useAlertOnNewVersion } from '@diversifiedfinance/app/hooks/use-alert-on-new-version';
import { useFeature } from '@growthbook/growthbook-react';
import { registerForPushNotificationsAsync } from '@diversifiedfinance/app/lib/register-push-notification';
import { localPreferencesV2Atom } from '@diversifiedfinance/app/lib/preferences';
import { useAtom } from 'jotai';
import { TopCarouselWithData } from '@diversifiedfinance/app/components/home/top-carousel';
import { UserStatus } from '@diversifiedfinance/app/components/home/user-status';
import { useSharedValue } from 'react-native-reanimated';
import { useVIPUserLevel } from '@diversifiedfinance/app/hooks/use-vip-user-level';

const lastAnsweredNotificationPermissionsAtom = localPreferencesV2Atom<number>(
	'has-answered-notifications-perm',
	0
);

export function Home() {
	useAlertOnNewVersion();
	const shouldAskAgainForPushPermissions = useFeature(
		'ask-for-push-on-home'
	).on;
	const [
		lastAnsweredNotificationPermissions,
		setLastAnsweredNotificationPermissions,
	] = useAtom(lastAnsweredNotificationPermissionsAtom);

	const { isLoading: isLoadingUser } = useUser({
		requireAuth: true,
		redirectIfProfileIncomplete: true,
	});
	const { isCustomer } = useVIPUserLevel();
	const { mutate: refreshUser } = useMyInfo();
	const { isLoading: isLoadingProjects, mutate: refreshProjects } =
		useProjectFeed();
	const welcomeCardHeight = useSharedValue(250);
	const { mutate: refreshTokenClaims } = useMyTokenClaims();
	const refreshAll = useCallback(() => {
		refreshUser();
		refreshProjects();
		refreshTokenClaims();
	}, []);

	useEffect(() => {
		const fourMonths = 4 * 30.5 * 24 * 3600 * 1000;
		if (
			shouldAskAgainForPushPermissions &&
			lastAnsweredNotificationPermissions < Date.now() - fourMonths
		) {
			(async () => {
				await registerForPushNotificationsAsync();
				await setLastAnsweredNotificationPermissions(Date.now());
			})();
		}
	}, [
		shouldAskAgainForPushPermissions,
		lastAnsweredNotificationPermissions,
		setLastAnsweredNotificationPermissions,
	]);

	return (
		<Screen
			isRefreshing={isLoadingProjects || isLoadingUser}
			onRefresh={refreshAll}
			withBackground={isCustomer}
			backgroundHeaderHeight={welcomeCardHeight}
		>
			<TopCarouselWithData />
			<UserStatus />
			<OngoingProjects />
			<NextProjects />
			<CompletedProjects />
		</Screen>
	);
}
