import { ClearCacheBtn } from './clear-cache-btn';
import { SettingSubTitle } from './settings-subtitle';
import { Link } from '@diversifiedfinance/app/navigation/link';
import { useAlert } from '@diversifiedfinance/design-system/alert';
import { Button } from '@diversifiedfinance/design-system/button';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import ChevronRight from '@diversifiedfinance/design-system/icon/ChevronRight';
import { Pressable } from '@diversifiedfinance/design-system/pressable';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

export const SettingAccountSlotHeader = () => {
	return (
		<View>
			<SettingSubTitle></SettingSubTitle>
		</View>
	);
};

export const SettingAccountSlotFooter = () => {
	const { t } = useTranslation();
	const supportMailURL = 'mailto:help@diversified.fi';
	const Alert = useAlert();

	const handleDeleteAccount = async () => {
		try {
			const canOpenUrl = await Linking.canOpenURL(supportMailURL);
			if (canOpenUrl) {
				Linking.openURL(supportMailURL);
			} else {
				Alert.alert(
					t('Error'),
					t('Could not find a mail client on your device.')
				);
			}
		} catch (error) {
			Alert.alert(
				t('Error'),
				t('Something went wrong. Please try again later.')
			);
		}
	};

	return (
		<View tw="mt-4 px-4">
			<View tw="flex flex-col items-start">
				<Text tw="text-base font-bold text-gray-900 dark:text-white">
					{t('Delete Account')}
				</Text>
				<View tw="h-4" />
				<Text tw="text-xs text-gray-500 dark:text-white md:text-sm">
					{t('This action cannot be undone.')}
				</Text>
				<View tw="h-4" />
				<View tw="flex flex-row">
					<Link href="mailto:support@diversified.fi">
						<Button
							variant="danger"
							size="small"
							onPress={handleDeleteAccount}
						>
							<Text tw="text-black dark:text-white">
								{t('Delete Account')}
							</Text>
						</Button>
					</Link>
				</View>
				<View tw="h-4" />
				<ClearCacheBtn />
			</View>
		</View>
	);
};

export type AccountSettingItemProps = {
	id: number | string;
	title: string;
	subRoute: string;
};

export const AccountSettingItem = (props: AccountSettingItemProps) => {
	const isDark = useIsDarkMode();
	const router = useRouter();
	const handleOnPressItem = (route: string) => {
		router.push(`/settings/${route}`);
	};

	return (
		<Pressable
			onPress={() => handleOnPressItem(props.subRoute)}
			tw="mb-2 w-full flex-row items-center justify-between rounded-md px-4 py-2"
		>
			<View tw="flex flex-col">
				<Text tw="text-sm text-gray-900 dark:text-white">
					{props.title}
				</Text>
			</View>
			<View tw="h-8 w-8 items-center justify-center">
				<ChevronRight
					width={24}
					height={24}
					color={isDark ? colors.gray[200] : colors.gray[700]}
				/>
			</View>
		</Pressable>
	);
};
