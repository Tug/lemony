import { useAlert } from '@diversifiedfinance/design-system/alert';
import { Button } from '@diversifiedfinance/design-system/button';
import { Text } from '@diversifiedfinance/design-system/text';
import { Image } from 'expo-image';
import { useCallback } from 'react';
import { deleteAppCache as deleteMMKVCache } from '@diversifiedfinance/app/lib/delete-cache';
import { useTranslation } from 'react-i18next';

export const ClearCacheBtn = () => {
	const { t } = useTranslation();
	const Alert = useAlert();
	const clearAppCache = useCallback(() => {
		Alert.alert(t('Clear app cache?'), '', [
			{
				text: t('Confirm'),
				onPress: async () => {
					deleteMMKVCache();
					await Image.clearDiskCache();
					await Image.clearMemoryCache();
				},
				style: 'destructive',
			},
			{
				text: t('Cancel'),
			},
		]);
	}, [Alert]);

	if (!__DEV__) return null;

	return (
		<Button size="small" onPress={clearAppCache}>
			<Text tw="text-black dark:text-white">{t('Clear Cache')}</Text>
		</Button>
	);
};
