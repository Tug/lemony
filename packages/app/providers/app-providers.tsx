import { growthbook } from '../lib/growthbook';
import { NavigationProvider } from '../navigation';
import { AuthProvider } from './auth-provider';
import { MuteProvider } from './mute-provider';
import { SWRProvider } from './swr-provider';
import { UserProvider } from './user-provider';
import { AlertProvider } from '@diversifiedfinance/design-system/alert';
import { ColorSchemeProvider } from '@diversifiedfinance/design-system/color-scheme';
import { LightBoxProvider } from '@diversifiedfinance/design-system/light-box';
import {
	SafeAreaProvider,
	initialWindowMetrics,
} from '@diversifiedfinance/design-system/safe-area';
import { SnackbarProvider } from '@diversifiedfinance/design-system/snackbar';
import { BottomSheetModalProvider } from '@diversifiedfinance/design-system/bottom-sheet';
import { GrowthBookProvider } from '@growthbook/growthbook-react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from '@diversifiedfinance/app/lib/keyboard-controller';
import { SettingsProvider } from '@diversifiedfinance/app/providers/settings-provider';
import { LocalAuthProvider } from '@diversifiedfinance/app/providers/local-auth-provider';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
	return (
		<GestureHandlerRootView style={{ flexGrow: 1 }}>
			<KeyboardProvider statusBarTranslucent>
				<SafeAreaProvider initialMetrics={initialWindowMetrics}>
					<ColorSchemeProvider>
						<AlertProvider>
							<LightBoxProvider>
								<SnackbarProvider>
									<NavigationProvider>
										<SWRProvider>
											<AuthProvider>
												<UserProvider>
													<SettingsProvider>
														<BottomSheetModalProvider>
															{/* @ts-ignore */}
															<GrowthBookProvider
																growthbook={
																	growthbook
																}
															>
																<MuteProvider>
																	<LocalAuthProvider>
																		{
																			children
																		}
																	</LocalAuthProvider>
																</MuteProvider>
															</GrowthBookProvider>
														</BottomSheetModalProvider>
													</SettingsProvider>
												</UserProvider>
											</AuthProvider>
										</SWRProvider>
									</NavigationProvider>
								</SnackbarProvider>
							</LightBoxProvider>
						</AlertProvider>
					</ColorSchemeProvider>
				</SafeAreaProvider>
			</KeyboardProvider>
		</GestureHandlerRootView>
	);
};
