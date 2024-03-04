import { Image } from 'expo-image';
import ImageColors from 'react-native-image-colors';
import { MMKV } from 'react-native-mmkv';
import {
	deleteCachedRemotePreferences,
	deleteLocalPreferences,
} from '@diversifiedfinance/app/lib/preferences';

export async function deleteAppCache() {
	const storage = new MMKV();
	storage.delete('app-cache');
	deleteCachedRemotePreferences();
	deleteLocalPreferences();
	await Image.clearDiskCache();
	await Image.clearMemoryCache();
	ImageColors.cache.clear();
}
