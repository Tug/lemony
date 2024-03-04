import {
	useEditPushNotificationsPreferences,
	usePushNotificationsPreferences,
} from '@diversifiedfinance/app/hooks/use-push-notifications-preferences';
import { Switch } from '@diversifiedfinance/design-system/switch';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { ScrollView } from '@diversifiedfinance/design-system/scroll-view';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@diversifiedfinance/design-system';
import {
	nGroups,
	pushNotificationTypes,
	getNotificationTitleAndDescription,
	getGroupName,
} from '@diversifiedfinance/app/components/settings/notifications/constants';
import type { PushNotificationKey } from '@diversifiedfinance/app/components/settings/notifications/constants';
import SettingsHeader from '@diversifiedfinance/app/components/settings/header';

export type PushNotificationSettingsProp = {};

export const NotificationSettings = ({}: PushNotificationSettingsProp) => {
	const { t } = useTranslation();
	const { data, isLoading } = usePushNotificationsPreferences();
	const { trigger } = useEditPushNotificationsPreferences();

	const validatedData = useMemo(() => {
		if (!data) return {};
		return Object.keys(data).reduce((result, key) => {
			if (pushNotificationTypes.includes(key as PushNotificationKey)) {
				result[key as PushNotificationKey] = data[key];
			}
			return result;
		}, {} as Record<PushNotificationKey, boolean>);
	}, [t, data]);

	const allGroupKeys = useMemo(() => Object.values(nGroups).flat(), []);
	const otherKeys = useMemo(() => {
		return (Object.keys(validatedData) as PushNotificationKey[]).filter(
			(key) => !allGroupKeys.includes(key)
		);
	}, [validatedData, allGroupKeys]);

	// Only update the groups if data has changed
	const notificationGroups = useMemo(
		() => ({ ...nGroups, Others: otherKeys }),
		[otherKeys]
	);

	if (isLoading || !data) {
		return (
			<View tw="animate-fade-in-250 h-28 items-center justify-center">
				<Spinner />
			</View>
		);
	}

	return (
		<ScrollView>
			<SettingsHeader title={t('Notifications')} />
			<View tw="my-4 px-4">
				{Object.entries(notificationGroups).map(
					([group, keys], index) => {
						if (keys.length === 0) {
							return null;
						}
						return (
							<View key={group}>
								<View tw={index === 0 ? 'mb-4 mt-2' : 'my-4'}>
									<Text tw="text-lg font-bold dark:text-white">
										{getGroupName(group)}
									</Text>
								</View>
								{keys.map((key, index) => {
									const value = data[key];
									const { title, description } =
										getNotificationTitleAndDescription(key);

									if (!title) {
										return null;
									}

									return (
										<View
											tw="flex-row items-start py-4"
											key={index.toString()}
										>
											<View tw="flex-1 md:ml-4">
												<View>
													<Text tw="text-base font-medium text-gray-900 dark:text-white">
														{title}
													</Text>
												</View>
												<View tw="mt-2.5">
													<Text tw="text-sm text-gray-500 dark:text-gray-300">
														{description}
													</Text>
												</View>
											</View>
											<View>
												<Switch
													size="small"
													checked={value as boolean}
													onChange={async () => {
														trigger(
															{
																pushKey: [key],
																pushValue:
																	!value,
															},
															{
																optimisticData:
																	(
																		current: any
																	) => ({
																		...current,
																		[key]: !value,
																	}),
																revalidate: false,
															}
														);
													}}
												/>
											</View>
										</View>
									);
								})}
							</View>
						);
					}
				)}
			</View>
			<View tw="h-12" />
		</ScrollView>
	);
};

export default NotificationSettings;
