import { MMKV } from 'react-native-mmkv';
import {
	LOCAL_PREFERENCES_KEY,
	REMOTE_PREFERENCES_KEY,
} from '@diversifiedfinance/app/lib/preferences/common';
import { atomWithUnecryptedStorage } from '@diversifiedfinance/app/lib/preferences/storage';

const prefStorage = new MMKV();
// TODO: migrate local preferences to localPrefStorageV2
const localPrefStorageV2 = new MMKV({ id: 'local-preferences-v2' });

// const remotePrefAtom = atomWithUnecryptedStorage(localPrefStorage);
// export const atomRemotePreferences = atom(REMOTE_PREFERENCES_KEY, {});

export const localPreferencesV2Atom =
	atomWithUnecryptedStorage(localPrefStorageV2);

export function getPreferences() {
	return {
		...getCachedRemotePreferences(),
		...getLocalPreferences(),
	};
}

export function getPreference(key: string) {
	return getPreferences()[key];
}

export function setCachedRemotePreferences(preferences: any) {
	prefStorage.set(REMOTE_PREFERENCES_KEY, JSON.stringify(preferences));
}

export function getCachedRemotePreferences() {
	const prefString = prefStorage.getString(REMOTE_PREFERENCES_KEY);
	if (!prefString) {
		return {};
	}
	return JSON.parse(prefString);
}

export function deleteCachedRemotePreferences() {
	prefStorage.delete(REMOTE_PREFERENCES_KEY);
}

export function getCachedRemotePreference(key: string) {
	return getCachedRemotePreferences()[key];
}

export function setLocalPreferences(preferences: any) {
	prefStorage.set(LOCAL_PREFERENCES_KEY, JSON.stringify(preferences));
}

export function getLocalPreferences() {
	const prefString = prefStorage.getString(LOCAL_PREFERENCES_KEY);
	if (!prefString) {
		return {};
	}
	return JSON.parse(prefString);
}

export function deleteLocalPreferences() {
	prefStorage.delete(LOCAL_PREFERENCES_KEY);
}

export function getLocalPreference(key: string) {
	return getLocalPreferences()[key];
}
