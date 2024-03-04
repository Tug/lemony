import getPath from '../../../navigation/lib/get-path';
import { SettingAccountSlotHeader } from '../components/settings-account-slot';
import SettingsHeader from '../header';
import { useManageAccount } from '@diversifiedfinance/app/hooks/use-manage-account';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { createParam } from '@diversifiedfinance/app/navigation/lib/use-param';
import { Button } from '@diversifiedfinance/design-system/button';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import Apple from '@diversifiedfinance/design-system/icon/Apple';
import GoogleOriginal from '@diversifiedfinance/design-system/icon/GoogleOriginal';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { useMemo, useEffect, useRef } from 'react';
import { Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAddMagicSocialAccount } from '@diversifiedfinance/app/hooks/use-add-magic-social-account';

export const SocialSettings = () => {
	const { t } = useTranslation();
	return (
		<ScrollView>
			<SettingsHeader title={t('Linked Accounts')} />
			<SettingAccountSlotHeader />
			<WalletSocialAccounts redirectUri={getPath('socialSettings')} />
		</ScrollView>
	);
};

type ConnectSocialProps = {
	redirectUri: string;
};

const { useParam } = createParam<{ did: string; type: string }>();

const socialAccounts = [
	{
		Icon: GoogleOriginal,
		type: 'google',
		name: 'Google',
	},
	{
		Icon: Apple,
		type: 'apple',
		name: 'Apple',
	},
] as const;

const WalletSocialAccounts = ({ redirectUri }: ConnectSocialProps) => {
	const { t } = useTranslation();
	const isDark = useIsDarkMode();
	const { trigger: addSocial, isMutating: isConnecting } =
		useAddMagicSocialAccount();
	const wallet = useUser().user?.data.profile.wallet_addresses_v2;

	const connected = useMemo(() => {
		const google = { address: '' };
		const apple = { address: '' };
		wallet?.forEach((v) => {
			if (v.is_apple) {
				apple.address = v.address;
			}
			if (v.is_google) {
				google.address = v.address;
			}
		});
		return {
			google,
			apple,
		};
	}, [wallet]);

	return (
		<>
			{socialAccounts.map((type) => {
				const Icon = type.Icon;
				return (
					<View
						key={type.type}
						tw="space-between mb-8 flex-row items-center justify-between px-4"
					>
						<View tw="flex-row items-center">
							<Icon
								height={32}
								width={32}
								color={isDark ? '#fff' : '#000'}
							/>
							<Text tw="mx-2 text-base font-semibold text-gray-900 dark:text-gray-100">
								{type.name}
							</Text>
						</View>
						{/*<Button*/}
						{/*	// variant={connected[type.type].address ? "danger" : "primary"}*/}
						{/*	onPress={async () => {*/}
						{/*		if (connected[type.type]?.address) {*/}
						{/*			removeAccount(*/}
						{/*				connected[type.type]?.address*/}
						{/*			);*/}
						{/*		} else {*/}
						{/*			addSocial({*/}
						{/*				type: type.type,*/}
						{/*			});*/}
						{/*		}*/}
						{/*	}}*/}
						{/*>*/}
						{/*	{connected[type.type].address*/}
						{/*		? t('Disconnect')*/}
						{/*		: t('Connect')}*/}
						{/*</Button>*/}
					</View>
				);
			})}
		</>
	);
};

export default SocialSettings;
