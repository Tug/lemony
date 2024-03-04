import { Platform, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Alert } from '@diversifiedfinance/design-system/alert';
import { Button } from '@diversifiedfinance/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

export function ContactUsButton() {
	const { t } = useTranslation();
	const onPress = async () => {
		const isCanOpen = await Linking.canOpenURL(
			'mailto:help@diversified.fi'
		);
		if (isCanOpen) {
			await Linking.openURL('mailto:help@diversified.fi');
		} else {
			await Clipboard.setStringAsync('help@diversified.fi');
			Alert.alert(
				t('The email address has been copied to your clipboard!')
			);
		}
	};

	return (
		<Button variant="primary" size="regular" onPress={onPress}>
			{t('Contact us')}
		</Button>
	);
}
