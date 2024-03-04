import { SettingsContext } from '@diversifiedfinance/app/context/settings-context';
import { useEffect, useMemo, ReactNode, useState } from 'react';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import {
	getLocalPreferences as getLocalPreferencesInStore,
	setLocalPreferences as setLocalPreferencesInStore,
	getCachedRemotePreferences,
	setCachedRemotePreferences,
} from '@diversifiedfinance/app/lib/preferences';
import { useUserSettings } from '@diversifiedfinance/app/hooks/api-hooks';

interface SettingsProviderProps {
	children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
	const { user } = useUser();
	const { data: remoteSettings, update: setPreferences } = useUserSettings();
	const [localPreferences, setLocalPreferences] = useState(
		getLocalPreferencesInStore()
	);

	const settingsContextValue = useMemo(
		() => ({
			...user?.data?.settings,
			...remoteSettings,
			paymentSandbox: Boolean(
				remoteSettings?.paymentSandbox ??
					user?.data.settings?.paymentSandbox
			),
			preferences: {
				...getCachedRemotePreferences(),
				...user?.data.settings?.preferences,
				...remoteSettings?.preferences,
				...localPreferences,
			},
			setLocalPreferences,
			setPreferences,
		}),
		[user?.data.settings, remoteSettings, localPreferences]
	);

	// sync local preferences with local storage
	useEffect(() => {
		setLocalPreferencesInStore(localPreferences);
	}, [localPreferences]);

	// sync remote preferences with local storage
	useEffect(() => {
		if (!remoteSettings?.preferences) {
			return;
		}
		setCachedRemotePreferences(remoteSettings.preferences);
	}, [user?.data.settings?.preferences, remoteSettings?.preferences]);

	return (
		<SettingsContext.Provider value={settingsContextValue}>
			{children}
		</SettingsContext.Provider>
	);
}
