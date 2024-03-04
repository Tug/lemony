import {
	deleteCachedRemotePreferences,
	deleteLocalPreferences,
} from '@diversifiedfinance/app/lib/preferences';

export function deleteAppCache() {
	localStorage.removeItem('app-cache');
	deleteCachedRemotePreferences();
	deleteLocalPreferences();
}
