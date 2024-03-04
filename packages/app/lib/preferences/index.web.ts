import {
	LOCAL_PREFERENCES_KEY,
	REMOTE_PREFERENCES_KEY,
} from '@diversifiedfinance/app/lib/preferences/common';
import { atomWithUnecryptedStorage } from '@diversifiedfinance/app/lib/preferences/storage';

export const localPreferencesV2Atom = atomWithUnecryptedStorage();

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
	localStorage.setItem(REMOTE_PREFERENCES_KEY, JSON.stringify(preferences));
}

export function getCachedRemotePreferences() {
	const prefString = localStorage.getItem(REMOTE_PREFERENCES_KEY);
	if (!prefString) {
		return {};
	}
	return JSON.parse(prefString);
}

export function deleteCachedRemotePreferences() {
	localStorage.removeItem(REMOTE_PREFERENCES_KEY);
}

export function getCachedRemotePreference(key: string) {
	return getCachedRemotePreferences()[key];
}

export function setLocalPreferences(preferences: any) {
	localStorage.setItem(LOCAL_PREFERENCES_KEY, JSON.stringify(preferences));
}

export function getLocalPreferences() {
	const prefString = localStorage.getItem(LOCAL_PREFERENCES_KEY);
	if (!prefString) {
		return {};
	}
	return JSON.parse(prefString);
}

export function deleteLocalPreferences() {
	localStorage.removeItem(LOCAL_PREFERENCES_KEY);
}

export function getLocalPreference(key: string) {
	return getLocalPreferences()[key];
}
