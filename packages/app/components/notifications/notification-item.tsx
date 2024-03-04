import { memo, useMemo, useCallback, useEffect } from 'react';
import { Linking, Platform } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';

import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { MessageFilled } from '@diversifiedfinance/design-system/icon';
import { Pressable } from '@diversifiedfinance/design-system/pressable';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { colors, styled } from '@diversifiedfinance/design-system/tailwind';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';

import { formatDateRelativeWithIntl } from '@diversifiedfinance/app/utilities';
import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import { NotificationType } from '@diversifiedfinance/types/diversified';
import { PushNotificationKey } from '@diversifiedfinance/app/components/settings/notifications/constants';
import BellFilled from '@diversifiedfinance/design-system/icon/BellFilled';
import { useTranslation } from 'react-i18next';
import Wallet from '@diversifiedfinance/design-system/icon/Wallet';
import { NOTIFICATION_TYPE_COPY } from './copies';

const StyledRectButton = styled(RectButton);
const PlatformButton =
	Platform.OS === 'ios' ? memo(StyledRectButton) : Pressable;

export type NotificationItemProp = {
	notification: NotificationType;
};

export const NotificationItem = ({ notification }: NotificationItemProp) => {
	const isDark = useIsDarkMode();
	const { t } = useTranslation();
	const router = useRouter();
	const icon = useMemo(
		() => getNotificationIcon(notification.type, isDark),
		[notification.type, isDark]
	);

	const notificationPressHandler = async () => {
		const notificationType = notification.type as PushNotificationKey;
		if (
			notification?.content.url &&
			(await Linking.canOpenURL(notification?.content.url))
		) {
			return Linking.openURL(notification?.content.url);
		}

		let path;
		if (notification?.content.path) {
			path = notification?.content.path;
		}

		switch (notificationType) {
			case 'new_project_primary_market':
			case 'new_project_secondary_market':
			case 'project_asset_sold':
				if (notification?.content?.project?.slug) {
					path = getPath('project', {
						slug: notification?.content?.project?.slug,
					});
				}
				break;
			case 'portfolio_monthly_update':
			case 'portfolio_weekly_update':
			case 'user_token_sold':
			case 'system_funds_received':
			case 'system_free_credits_received':
				path = getPath('portfolio');
				break;
		}

		if (!path) return;

		router.push(path);
	};

	const notificationTypeCopy = NOTIFICATION_TYPE_COPY[notification.type]?.(
		notification.content,
		t
	);
	const fallbackCopy = t(notification.content.description);
	const copy = notificationTypeCopy ?? fallbackCopy;

	if (copy === undefined || icon === undefined) {
		return null;
	}

	if (notification.type === 'special_home_carousel') {
		return null;
	}

	return (
		<View tw="web:md:hover:bg-gray-100 web:md:dark:hover:bg-gray-800 web:rounded-md select-none flex-row items-center overflow-hidden md:mx-2">
			<PlatformButton
				onPress={notificationPressHandler}
				tw={'web:px-2 flex w-full flex-row justify-between px-4 py-3.5'}
				underlayColor={isDark ? colors.gray[100] : colors.gray[800]}
				rippleColor={isDark ? colors.gray[100] : colors.gray[800]}
			>
				<View tw="mr-1">{icon}</View>
				<NotificationDescription notification={notification} />
			</PlatformButton>
		</View>
	);
};

NotificationItem.displayName = 'NotificationItem';

type NotificationDescriptionProps = {
	notification: NotificationType;
};

const NotificationDescription = ({
	notification,
}: NotificationDescriptionProps) => {
	const { t } = useTranslation();
	const formatDistance = formatDateRelativeWithIntl(notification.visibleAt);
	const copy =
		NOTIFICATION_TYPE_COPY[notification.type]?.(notification.content, t) ??
		t(notification.content.description, notification.content.vars ?? {});

	return (
		<View tw="flex-1 flex-row justify-between">
			<Text
				tw="text-13 web:max-w-[80%] mr-4 max-w-[68vw] self-center text-gray-600 dark:text-gray-400"
				ellipsizeMode="tail"
				numberOfLines={2}
			>
				{copy}
			</Text>
			{Boolean(formatDistance) && (
				<View tw="items-end">
					<Text tw="text-13 text-gray-500">{`${formatDistance}`}</Text>
				</View>
			)}
		</View>
	);
};

NotificationDescription.displayName = 'NotificationDescription';

export const getNotificationIcon = (type: string, isDark) => {
	const color = isDark ? colors.white : colors.black;
	switch (type) {
		case 'new_project_primary_market':
		case 'new_project_secondary_market':
		case 'user_token_sold':
		case 'user_token_acquired':
			return <BellFilled width={20} height={20} color={color} />;
		case 'marketing_general':
			return <MessageFilled width={20} height={20} color={color} />;
		case 'portfolio_monthly_update':
		case 'portfolio_weekly_update':
		case 'funds_received':
		case 'free_credits_received':
			return <Wallet width={20} height={20} color={color} />;
		default:
			return <BellFilled width={20} height={20} color={color} />;
	}
};
