import { Text, View } from '@diversifiedfinance/design-system';
import { useTranslation } from 'react-i18next';
import { Switch } from '@diversifiedfinance/design-system/switch';
import { useFeature } from '@growthbook/growthbook-react';
import {
	useIsBiometricsEnabled,
	AuthenticationType,
} from '@diversifiedfinance/app/hooks/use-biometrics';
import { Platform } from 'react-native';

export default function Security() {
	const { t } = useTranslation();
	const biometricsFeatureDisabled = useFeature('biometrics').off;
	const {
		isBiometricsOptionEnabled,
		setIsBiometricsOptionEnabled,
		authTypes,
	} = useIsBiometricsEnabled();

	let biometricsLabel = t('Biometric Prompt');
	if (Platform.OS === 'ios') {
		if (authTypes.includes(AuthenticationType.FACIAL_RECOGNITION)) {
			biometricsLabel = t('Face ID');
		} else if (authTypes.includes(AuthenticationType.FINGERPRINT)) {
			biometricsLabel = t('Touch ID');
		}
	} else if (Platform.OS === 'android') {
		biometricsLabel = t('Biometric Prompt');
	}

	if (biometricsFeatureDisabled || Platform.OS === 'web') {
		return null;
	}

	return (
		<View tw="mt-5">
			<View tw="m-4">
				<Text tw="text-2xl font-bold text-black dark:text-white">
					{t('Security')}
				</Text>
			</View>
			<View tw="mx-4 my-4 flex-row items-center justify-between">
				<Text tw="text-base text-gray-900 dark:text-white">
					{biometricsLabel}
				</Text>
				<View tw="shrink flex-row items-center justify-end">
					<Switch
						onChange={setIsBiometricsOptionEnabled}
						checked={isBiometricsOptionEnabled}
					/>
				</View>
			</View>
		</View>
	);
}
