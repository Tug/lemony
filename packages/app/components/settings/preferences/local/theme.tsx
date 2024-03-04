import PreferencesEntry from '../entry';
import { useColorScheme } from '@diversifiedfinance/design-system/color-scheme';
import { ColorSchemeName } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getDisabledSystemTheme } from '@diversifiedfinance/design-system/color-scheme/store';
import { useEffect, useState } from 'react';

export const ThemePreference = () => {
	const { t } = useTranslation();
	// colorScheme will never be null here, need to get the real value
	const { colorScheme, setColorScheme } = useColorScheme();
	const isSystemThemeDisabled = getDisabledSystemTheme();
	const [currentValue, setCurrentValue] = useState<ColorSchemeName>(
		isSystemThemeDisabled ? colorScheme : null
	);

	useEffect(() => {
		setColorScheme(currentValue);
	}, [currentValue, setColorScheme]);

	const getOptionsLabels = (theme: 'light' | 'dark' | null) => {
		if (!theme) {
			return t('System');
		}

		const labels = {
			dark: t('Dark'),
			light: t('Light'),
		};
		return labels[theme];
	};

	return (
		<PreferencesEntry<ColorSchemeName>
			preferenceName={t('Appearance')}
			currentValue={currentValue}
			optionsValues={[null, 'light', 'dark']}
			optionsLabels={getOptionsLabels}
			onChange={setCurrentValue}
		/>
	);
};
