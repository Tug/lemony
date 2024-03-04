import { useProjectFeed } from '../../hooks/use-project-feed';
import { useUser } from '../../hooks/use-user';
import Screen from '@diversifiedfinance/app/components/screen';
import React, { useCallback, useEffect, useState } from 'react';
import {
	useMyInfo,
	useMyTokenClaims,
} from '@diversifiedfinance/app/hooks/api-hooks';
import { useSharedValue } from 'react-native-reanimated';
import { useVIPUserLevel } from '@diversifiedfinance/app/hooks/use-vip-user-level';
import ProjectScrollList from '@diversifiedfinance/app/components/project-scroll-list';
import { Text, View } from '@diversifiedfinance/design-system';
import { useTranslation } from 'react-i18next';

export function Home() {
	const { t } = useTranslation();
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

	return (
		<Screen
			isRefreshing={isLoadingProjects || isLoadingUser}
			onRefresh={refreshAll}
			withBackground={isCustomer}
			backgroundHeaderHeight={welcomeCardHeight}
		>
			<View>
				<View tw="mx-auto mt-12 mb-2">
					<Text tw="text-left text-3xl dark:text-white">
						{t('Live opportunities')}
					</Text>
				</View>
				<ProjectScrollList filter="ongoingOrVip" />
			</View>
			<View>
				<View tw="mx-auto mt-12 mb-2">
					<Text tw="text-left text-3xl dark:text-white">
						{t('Next releases')}
					</Text>
				</View>
				<ProjectScrollList filter="upcoming" />
			</View>
			<View>
				<View tw="mx-auto mt-12 mb-2">
					<Text tw="text-left text-3xl dark:text-white">
						{t('Assets Sold')}
					</Text>
				</View>
				<ProjectScrollList filter="complete" />
			</View>
		</Screen>
	);
}
