import { createStackNavigator } from '../lib/create-stack-navigator';
import { OnboardingNavigatorParams } from './types';

import {
	OnboardingHomeScreen,
	OnboardingSignInScreen,
	OnboardingSignUpScreen,
	OnboardingInfoScreen,
	OnboardingAcceptTermsScreen,
	OnboardingKYCScreen,
	OnboardingDoneScreen,
} from '@diversifiedfinance/app/screens/onboarding';

const Stack = createStackNavigator<OnboardingNavigatorParams>();

export function OnboardingNavigator() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen
				name="onboardingHome"
				component={OnboardingHomeScreen}
			/>
			<Stack.Screen
				name="onboardingSignIn"
				component={OnboardingSignInScreen}
			/>
			<Stack.Screen
				name="onboardingSignUp"
				component={OnboardingSignUpScreen}
			/>
			<Stack.Screen
				name="onboardingInfo"
				component={OnboardingInfoScreen}
			/>
			<Stack.Screen
				name="onboardingAcceptTerms"
				component={OnboardingAcceptTermsScreen}
			/>
			<Stack.Screen
				name="onboardingKYC"
				component={OnboardingKYCScreen}
			/>
			<Stack.Screen
				name="onboardingDone"
				component={OnboardingDoneScreen}
			/>
		</Stack.Navigator>
	);
}
