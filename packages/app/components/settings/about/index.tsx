import SettingsHeader from '../header';
import { ScrollView } from 'react-native';
import { Button, Text, View } from '@diversifiedfinance/design-system';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { useTranslation } from 'react-i18next';
import { getAppVersion } from '@diversifiedfinance/app/utilities';
import { deleteAppCache } from '@diversifiedfinance/app/lib/delete-cache';
import { useCallback, useContext } from 'react';
import { toast } from '@diversifiedfinance/design-system/toast';
import { SettingsContext } from '@diversifiedfinance/app/context/settings-context';

type AboutSettingsProps = {};

export const AboutSettings = ({}: AboutSettingsProps) => {
	const { t } = useTranslation();
	const { user } = useUser();
	const isSandbox = user?.data.settings.paymentSandbox ?? false;
	const context = useContext(SettingsContext);
	const clearAppCache = useCallback(() => {
		deleteAppCache();
		context?.setLocalPreferences({});
		toast.success('Cleared!');
	}, []);

	return (
		<>
			<SettingsHeader title={t('About')} />
			<ScrollView>
				<View tw="mx-4 items-center bg-white dark:bg-black">
					<View tw="w-full flex-col">
						<View tw="my-6 flex-row justify-between">
							<View>
								<Text tw="text-base text-gray-900 dark:text-white">
									{t('App Version')}
								</Text>
							</View>
							<View>
								<Text tw="text-base text-gray-900 dark:text-white">
									{getAppVersion()}
								</Text>
							</View>
						</View>
					</View>
					<View tw="w-full flex-col">
						<View tw="my-6 flex-row justify-between">
							<View>
								<Text tw="text-base text-gray-900 dark:text-white">
									{t('API Version')}
								</Text>
							</View>
							<View>
								<Text tw="text-base text-gray-900 dark:text-white">
									v1.0
									{process.env.STAGE !== 'production'
										? ` (${process.env.STAGE})`
										: ''}
								</Text>
							</View>
						</View>
					</View>
					{isSandbox && (
						<View tw="w-full flex-col">
							<View tw="my-4 flex-row justify-between">
								<View>
									<Text tw="text-base text-gray-900 dark:text-white">
										{t('Payment sandbox')}
									</Text>
								</View>
								<View>
									<Text tw="text-base text-gray-900 dark:text-white">
										{t('Enabled')}
									</Text>
								</View>
							</View>
						</View>
					)}
					<View tw="w-full flex-col">
						<View tw="my-4 flex-row items-center justify-between">
							<View>
								<Text tw="text-base text-gray-900 dark:text-white">
									{t('Clear application cache')}
								</Text>
							</View>
							<View>
								<Button
									variant="tertiary"
									onPress={clearAppCache}
								>
									{t('Clear now')}
								</Button>
							</View>
						</View>
					</View>
				</View>
			</ScrollView>
		</>
	);
};

export default AboutSettings;
