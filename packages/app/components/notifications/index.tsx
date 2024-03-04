import { useCallback, useEffect, useRef, useState, memo, useMemo } from 'react';
import { Platform, RefreshControl, useWindowDimensions } from 'react-native';

import { ListRenderItemInfo } from '@shopify/flash-list';

import {
	useIsDarkMode,
	useOnFocus,
} from '@diversifiedfinance/design-system/hooks';
import { InfiniteScrollList } from '@diversifiedfinance/design-system/infinite-scroll-list';
import { Spinner } from '@diversifiedfinance/design-system/spinner';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';

import { NotificationsSettingIcon } from '@diversifiedfinance/app/components/header/notifications-setting-icon';
import { NotificationItem } from '@diversifiedfinance/app/components/notifications/notification-item';
import { useMyInfo } from '@diversifiedfinance/app/hooks/api-hooks';
import { useNotifications } from '@diversifiedfinance/app/hooks/use-notifications';
import { usePlatformBottomHeight } from '@diversifiedfinance/app/hooks/use-platform-bottom-height';
import { axios } from '@diversifiedfinance/app/lib/axios';
import {
	useScrollToTop,
	useFocusEffect,
} from '@diversifiedfinance/app/lib/react-navigation/native';

import { EmptyPlaceholder } from '../empty-placeholder';
import { NotificationType } from '@diversifiedfinance/types/diversified';
import { reloadTranslations } from '@diversifiedfinance/app/lib/i18n';
import { useTranslation } from 'react-i18next';
import { DEFAULT_HEADER_HEIGHT } from '@diversifiedfinance/app/components/header';

const Header = () => {
	if (Platform.OS === 'web') {
		return (
			<View tw="hidden w-full flex-row pb-4 pl-4 pt-8 md:flex">
				<Text tw="text-lg font-bold text-gray-900 dark:text-white">
					Notifications
				</Text>
				<View tw="absolute right-2 top-6">
					<NotificationsSettingIcon size={24} />
				</View>
			</View>
		);
	}

	return null;
};
type NotificationsProps = {
	hideHeader?: boolean;
	useWindowScroll?: boolean;
};

const keyExtractor = (item: NotificationType) => {
	return item.id.toString();
};

/*
const getItemType = (item: NotificationType) => {
  return item.type_name;
};
*/

export const Notifications = ({
	hideHeader = false,
	useWindowScroll = true,
}: NotificationsProps) => {
	const { t } = useTranslation();
	const {
		visibleNotifications: notifications,
		fetchMore,
		refresh,
		isRefreshing,
		isLoadingMore,
		isLoading,
	} = useNotifications();
	const { mutate: refetchMyInfo } = useMyInfo();
	const isDark = useIsDarkMode();
	const headerHeight = DEFAULT_HEADER_HEIGHT;
	const bottomBarHeight = usePlatformBottomHeight();
	const { height: windowHeight } = useWindowDimensions();
	const [translationsReloading, setTranslationsReloading] =
		useState<boolean>(false);
	const listRef = useRef<any>();
	useScrollToTop(listRef);

	const refreshNotifications = useCallback(async () => {
		// force reload translations for current language
		setTranslationsReloading(true);
		try {
			await reloadTranslations();
		} finally {
			setTranslationsReloading(false);
		}
		refresh();
		resetNotificationLastOpenedTime();
	}, [refresh]);

	const resetNotificationLastOpenedTime = useCallback(() => {
		setTimeout(async () => {
			try {
				await axios({
					url: '/api/user/check-notifications',
					method: 'POST',
					data: {},
				});
			} catch (err) {
				console.error(err);
			} finally {
				refetchMyInfo();
			}
		}, 1000);
	}, [refetchMyInfo]);

	useFocusEffect(resetNotificationLastOpenedTime);

	const renderItem = useCallback(
		({ item }: ListRenderItemInfo<NotificationType>) => {
			return <NotificationItem notification={item} />;
		},
		[]
	);

	const ListFooterComponent = useCallback(() => {
		if (isLoadingMore && notifications.length > 0 && !isLoading)
			return (
				<View tw="web:pt-2 items-center pb-2">
					<Spinner size="small" />
				</View>
			);
		return null;
	}, [isLoadingMore, isLoading, notifications.length]);

	if (!isLoading && notifications.length === 0) {
		return (
			<EmptyPlaceholder
				title={t('You have no notifications yet.')}
				tw="flex-1 items-center justify-center mb-24"
			/>
		);
	}

	if (isLoading && notifications.length === 0 && isLoadingMore) {
		return (
			<View tw="flex-1 items-center justify-center">
				<Spinner size="small" />
			</View>
		);
	}

	return (
		<>
			<InfiniteScrollList
				useWindowScroll={useWindowScroll}
				data={notifications}
				ListHeaderComponent={Platform.select({
					web: hideHeader ? undefined : Header,
					default: undefined,
				})}
				// for blur header effect on iOS
				style={{
					height: Platform.select({
						default: windowHeight - bottomBarHeight - headerHeight,
						web: useWindowScroll
							? windowHeight - bottomBarHeight
							: undefined,
					}),
				}}
				contentContainerStyle={Platform.select({
					default: {
						paddingBottom: bottomBarHeight,
					},
					web: {},
				})}
				refreshControl={
					<RefreshControl
						refreshing={translationsReloading || isRefreshing}
						onRefresh={refreshNotifications}
						tintColor={isDark ? colors.gray[200] : colors.gray[700]}
						colors={[colors.violet[500]]}
						progressBackgroundColor={
							isDark ? colors.gray[200] : colors.gray[100]
						}
					/>
				}
				containerTw="pretty-scrollbar"
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				onEndReached={fetchMore}
				refreshing={translationsReloading || isRefreshing}
				onRefresh={refreshNotifications}
				ListFooterComponent={ListFooterComponent}
				ref={listRef}
				estimatedItemSize={60}
			/>
		</>
	);
};

Notifications.displayName = 'Notifications';
