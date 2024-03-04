import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';

import { ColorSchemeProvider } from '@diversifiedfinance/design-system/color-scheme';
import { SafeAreaProvider } from '@diversifiedfinance/design-system/safe-area';

import { AlertProvider } from '@diversifiedfinance/design-system/alert';
import { SnackbarProvider } from '@diversifiedfinance/design-system/snackbar';
import { ToastProvider } from '@diversifiedfinance/design-system/toast';
import { View } from '@diversifiedfinance/design-system/view';

import '../styles/globals.css';

enableScreens(true);

const Stack = createNativeStackNavigator();

export const parameters = {
	actions: { argTypesRegex: '^on[A-Z].*' },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
};

export const decorators = [
	(Story) => (
		<View tw="flex-1 h-full justify-center dark:bg-gray-900">
			<BottomSheetModalProvider>
				<SafeAreaProvider>
					<ColorSchemeProvider>
						<ToastProvider>
							<AlertProvider>
								<SnackbarProvider>
									<NavigationContainer>
										<Stack.Navigator
											screenOptions={{
												headerShown: false,
											}}
										>
											<Stack.Screen
												name="Storybook"
												component={Story}
											/>
										</Stack.Navigator>
									</NavigationContainer>
								</SnackbarProvider>
							</AlertProvider>
						</ToastProvider>
					</ColorSchemeProvider>
				</SafeAreaProvider>
			</BottomSheetModalProvider>
		</View>
	),
];
