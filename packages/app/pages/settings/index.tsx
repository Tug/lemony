import { createStackNavigator } from '@diversifiedfinance/app/navigation/lib/create-stack-navigator';
import { SettingsStackParams } from '@diversifiedfinance/app/navigation/navigators/types';
import { default as SettingsScreen } from '@diversifiedfinance/app/components/settings';
import { default as AccountSettingsScreen } from '@diversifiedfinance/app/components/settings/account';
import { default as SocialSettingsScreen } from '@diversifiedfinance/app/components/settings/account/social';
import { default as DeleteAccountSettingsScreen } from '@diversifiedfinance/app/components/settings/account/delete';
import { default as KYCSettingsScreen } from '@diversifiedfinance/app/components/settings/kyc';
import { default as PreferencesSettingsScreen } from '@diversifiedfinance/app/components/settings/preferences';
import { default as ProfileSettingsScreen } from '@diversifiedfinance/app/components/settings/profile';
import { default as AboutSettingsScreen } from '@diversifiedfinance/app/components/settings/about';
import { default as BankingSettingsScreen } from '@diversifiedfinance/app/components/settings/banking';
import { default as BankAccountSettingsScreen } from '@diversifiedfinance/app/components/settings/banking/bank-account';
import { default as NotificationsSettingsScreen } from '@diversifiedfinance/app/components/settings/notifications';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import { screenOptions } from '@diversifiedfinance/app/navigation/lib/navigator-screen-options';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { View } from '@diversifiedfinance/design-system';

const SettingsStack = createStackNavigator<SettingsStackParams>();

function SettingsNavigator() {
	const { t } = useTranslation();
	const { top: safeAreaTop } = useSafeAreaInsets();
	const isDark = useIsDarkMode();

	return (
		<SettingsStack.Navigator
			initialRouteName="settings"
			screenOptions={{ headerShown: false }}
		>
			<SettingsStack.Screen
				name="settings"
				component={SettingsScreen}
				options={screenOptions({
					safeAreaTop,
					isDark,
					headerCenter: t('Settings'),
					headerLeft: () => <View />,
				})}
			/>
			<SettingsStack.Screen
				name="profileSettings"
				component={ProfileSettingsScreen}
			/>
			<SettingsStack.Screen
				name="accountSettings"
				component={AccountSettingsScreen}
			/>
			<SettingsStack.Screen
				name="socialSettings"
				component={SocialSettingsScreen}
			/>
			<SettingsStack.Screen
				name="deleteSettings"
				component={DeleteAccountSettingsScreen}
			/>
			<SettingsStack.Screen
				name="bankingSettings"
				component={BankingSettingsScreen}
			/>
			<SettingsStack.Screen
				name="bankAccountSettings"
				component={BankAccountSettingsScreen}
			/>
			<SettingsStack.Screen
				name="preferencesSettings"
				component={PreferencesSettingsScreen}
			/>
			<SettingsStack.Screen
				name="notificationSettings"
				component={NotificationsSettingsScreen}
			/>
			<SettingsStack.Screen
				name="kycSettings"
				component={KYCSettingsScreen}
			/>
			<SettingsStack.Screen
				name="aboutSettings"
				component={AboutSettingsScreen}
			/>
		</SettingsStack.Navigator>
	);
}

export default SettingsNavigator;
