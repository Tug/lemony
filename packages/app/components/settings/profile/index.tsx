import { useTabState } from '../../../hooks/use-tab-state';
import { createParam } from '../../../navigation/lib/use-param';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import {
	SceneRendererProps,
	HeaderTabView,
	Route,
	TabScrollView,
} from '@diversifiedfinance/design-system/tab-view';
import { View } from '@diversifiedfinance/design-system/view';
import React, { forwardRef, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PersonalInformation } from './personal-information';
import { Address } from './address';
import { Referral } from './referral';
import { useScrollToTop } from '@diversifiedfinance/app/lib/react-navigation/native';
import SettingsHeader from '@diversifiedfinance/app/components/settings/header';

const { useParam } = createParam();

export type ProfileTabListRef = {
	refresh: () => void;
};

const routeComponents = [PersonalInformation, Address, Referral];

type TabListProps = {
	index: number;
};

export const ProfileTabList = forwardRef<ProfileTabListRef, TabListProps>(
	({ index }, ref) => {
		const listRef = useRef(null);
		useScrollToTop(listRef);
		const Component = routeComponents[index];

		return (
			<TabScrollView
				contentContainerStyle={{
					marginTop: 4,
					alignItems: 'stretch',
				}}
				index={index}
				ref={listRef}
			>
				<View tw="mx-4 mb-32 mt-4">
					<Component />
				</View>
			</TabScrollView>
		);
	}
);

export function ProfileSettings(): React.ReactElement {
	const { t } = useTranslation();
	const { index, setIndex, routes } = useTabState(
		[
			{
				key: 'personal',
				title: t('Personal Information') as string,
			},
			{
				key: 'address',
				title: t('Residence Address') as string,
			},
			{
				key: 'referral',
				title: t('Referral') as string,
			},
		].map((item, index) => ({ ...item, index }))
	);
	const { bottom } = useSafeAreaInsets();

	const renderScene = useCallback(
		({
			route: { index: routeIndex },
		}: SceneRendererProps & {
			route: Route;
		}) => {
			return <ProfileTabList index={routeIndex} />;
		},
		[]
	);

	const renderHeader = useCallback(() => {
		return (
			<View tw="items-center bg-white dark:bg-black">
				<View tw="w-full max-w-screen-xl">
					<SettingsHeader title={t('My Profile')} />
				</View>
			</View>
		);
	}, [t]);

	return (
		<HeaderTabView
			navigationState={{ index, routes }}
			renderScene={renderScene}
			onIndexChange={setIndex}
			renderScrollHeader={renderHeader}
			minHeaderHeight={0}
			sceneContainerStyle={{
				paddingBottom: Math.max(bottom, 20),
			}}
			autoWidthTabBar
		/>
	);
}

export default ProfileSettings;
