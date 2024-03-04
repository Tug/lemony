import { useContext } from 'react';
import { SettingsContext } from '@diversifiedfinance/app/context/settings-context';

export function usePreference(
	preferenceKey: string,
	{ saveOnProfile = true }: { saveOnProfile?: boolean } = {}
) {
	const context = useContext(SettingsContext);

	if (!context) {
		throw new Error(
			'You need to add `SettingsProvider` to your root component'
		);
	}

	const { preferences, setLocalPreferences, setPreferences } = context;

	const value = preferences?.[preferenceKey];
	const update = async (newValue: any) => {
		if (saveOnProfile) {
			setPreferences({
				[preferenceKey]: newValue,
			});
		} else {
			setLocalPreferences({
				[preferenceKey]: newValue,
			});
		}
	};

	return [value, update];
}
