import { CheckoutScreen } from '../../screens/checkout';
import { TokenClaimScreen } from '../../screens/token-claim';
import { LoginScreen, SignupScreen } from '../../screens/login';
import { ProjectScreen } from '../../screens/project';
import { VerifyEmailScreen } from '../../screens/settings/modals/verify-email';
import { EditProfileScreen } from '../../screens/settings/modals/edit-profile';
import { EditAddressScreen } from '../../screens/settings/modals/edit-address';
import { VerifyPhoneNumberScreen } from '../../screens/settings/modals/verify-phone-number';
import { AddBankAccountScreen } from '../../screens/settings/modals/add-bank-account';
import { CreditWalletScreen } from '../../screens/credit-wallet';
import { AddCardScreen } from '../../screens/add-card';
import { ReferAFriendScreen } from '../../screens/refer-a-friend';
import { VIPProgramScreen } from '../../screens/vip-program';
import { HowItWorksScreen } from '@diversifiedfinance/app/screens/how-it-works';
import { BottomTabNavigator } from './bottom-tab';
import { createStackNavigator } from '../lib/create-stack-navigator';
import { RootStackNavigatorParams } from './types';
import { useNetWorkConnection } from '@diversifiedfinance/app/hooks/use-network-connection';
import { screenOptions } from '@diversifiedfinance/app/navigation/lib/navigator-screen-options';
import { OnboardingNavigator } from './onboarding';
import { useAuth } from '@diversifiedfinance/app/hooks/auth/use-auth';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { LockScreen } from '@diversifiedfinance/app/navigation/components/lock-screen';
import { useTranslation } from 'react-i18next';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { useHandleNotification } from '@diversifiedfinance/app/hooks/use-handle-notification';
import SettingsNavigator from '@diversifiedfinance/app/pages/settings';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';

const Stack = createStackNavigator<RootStackNavigatorParams>();

export function RootStackNavigator() {
	const { t, ready: i18nReady } = useTranslation();
	const isDark = useIsDarkMode();
	useNetWorkConnection();
	useHandleNotification();
	const { authenticationStatus } = useAuth();
	const initialRouteName =
		authenticationStatus === 'AUTHENTICATED' ||
		authenticationStatus === 'REFRESHING'
			? 'bottomTabs'
			: 'onboarding';

	// // Uncomment to force navigation to a specific screen
	// const navigateTo = useNavigateToScreen(true);
	// useEffect(() => {
	// 	navigateTo('onboardingHome');
	// }, []);

	if (!i18nReady) {
		return <LockScreen hideLock />;
	}

	return (
		<>
			<Stack.Navigator
				initialRouteName={initialRouteName}
				// screenOptions={
				// 	// TODO: revisit temporary hack for android
				// 	// See https://github.com/react-navigation/react-navigation/issues/6520
				// 	Platform.OS === 'android'
				// 		? {
				// 				animation: 'none',
				// 				animationEnabled: false,
				// 				obscureBackground: false,
				// 		  }
				// 		: undefined
				// }
			>
				{/* Bottom tab navigator */}
				<Stack.Screen
					name="bottomTabs"
					component={BottomTabNavigator}
					options={{
						headerShown: false,
					}}
				/>

				<Stack.Screen
					name="onboarding"
					component={OnboardingNavigator}
					options={{
						headerShown: false,
						statusBarStyle: 'dark',
						gestureEnabled: false,
					}}
				/>

				<Stack.Screen
					name="vipProgram"
					component={VIPProgramScreen}
					options={screenOptions({
						isDark,
						headerCenter: t('VIP Programme'),
					})}
				/>

				{/* Screens without default header */}
				<Stack.Group
					screenOptions={{
						headerShown: false,
						fullScreenGestureEnabled: true,
						animationDuration:
							Platform.OS === 'ios' ? 400 : undefined,
						animation:
							Platform.OS === 'android' ? 'none' : 'default',
						statusBarStyle: isDark ? 'light' : 'dark',
						navigationBarColor: isDark
							? 'rgba(0,0,0,0.95)'
							: 'rgba(255,255,255,1)',
					}}
				>
					<Stack.Screen
						name="project"
						component={ProjectScreen}
						getId={({ params }) => `project-${params.slug}`}
					/>
					<Stack.Screen
						name="howItWorks"
						component={HowItWorksScreen}
					/>
				</Stack.Group>

				{/* Native (iOS) Modals */}
				<Stack.Group
					screenOptions={{
						headerShown: false,
						animation: Platform.OS === 'ios' ? 'default' : 'none',
						presentation:
							Platform.OS === 'ios'
								? 'modal'
								: 'transparentModal',
					}}
				>
					<Stack.Screen name="login" component={LoginScreen} />
					<Stack.Screen name="signup" component={SignupScreen} />
					<Stack.Screen
						name="editProfile"
						component={EditProfileScreen}
					/>
					<Stack.Screen
						name="editAddress"
						component={EditAddressScreen}
					/>
					<Stack.Screen
						name="addBankAccount"
						component={AddBankAccountScreen}
					/>
					<Stack.Screen
						name="verifyEmail"
						component={VerifyEmailScreen}
					/>
					<Stack.Screen
						name="verifyPhoneNumber"
						component={VerifyPhoneNumberScreen}
					/>
					<Stack.Screen name="checkout" component={CheckoutScreen} />
					<Stack.Screen
						name="tokenClaim"
						component={TokenClaimScreen}
					/>
					<Stack.Screen
						name="creditWallet"
						component={CreditWalletScreen}
					/>
					<Stack.Screen name="addCard" component={AddCardScreen} />
					<Stack.Screen
						name="referAFriend"
						component={ReferAFriendScreen}
					/>
				</Stack.Group>

				{/* Settings Navigator */}
				<Stack.Screen name="settings" component={SettingsNavigator} />
			</Stack.Navigator>
		</>
	);
}
