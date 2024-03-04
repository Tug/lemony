import { createContext } from 'react';

type SettingContextType = {
	paymentSandbox: boolean;
	preferences: any;
	setPreferences: (prefs: any) => void;
	setLocalPreferences: (prefs: any) => void;
};

export const SettingsContext = createContext<SettingContextType | null>(null);
