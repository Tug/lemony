import dynamic from 'next/dynamic';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './auth-provider';
import { MagicProvider } from './magic-provider.web';
import { MuteProvider } from './mute-provider';
import { SWRProvider } from './swr-provider';
import { UserProvider } from './user-provider';
import { growthbook } from '@diversifiedfinance/app/lib/growthbook';
import { NavigationProvider } from '@diversifiedfinance/app/navigation';
// import { AlertProvider } from '@diversifiedfinance/design-system/alert';
import { ColorSchemeProvider } from '@diversifiedfinance/design-system/color-scheme';
import { LightBoxProvider } from '@diversifiedfinance/design-system/light-box';
import { SafeAreaProvider } from '@diversifiedfinance/design-system/safe-area';
import { SnackbarProvider } from '@diversifiedfinance/design-system/snackbar';
import { BottomSheetModalProvider } from '@diversifiedfinance/design-system/bottom-sheet';
import { GrowthBookProvider } from '@growthbook/growthbook-react';
import { SettingsProvider } from '@diversifiedfinance/app/providers/settings-provider';
import { LocalAuthProvider } from '@diversifiedfinance/app/providers/local-auth-provider';

const AlertProvider = dynamic(
	() => import('@diversifiedfinance/design-system/alert'),
	{
		ssr: false,
	}
);

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
	return (
		<GestureHandlerRootView>
			<MagicProvider>
				<ColorSchemeProvider>
					<SafeAreaProvider>
						<LightBoxProvider>
							<AlertProvider>
								<SnackbarProvider>
									<SWRProvider>
										<AuthProvider>
											<UserProvider>
												<SettingsProvider>
													<BottomSheetModalProvider>
														<GrowthBookProvider
															growthbook={
																growthbook
															}
														>
															<NavigationProvider>
																<MuteProvider>
																	<LocalAuthProvider>
																		{
																			children
																		}
																	</LocalAuthProvider>
																</MuteProvider>
															</NavigationProvider>
														</GrowthBookProvider>
													</BottomSheetModalProvider>
												</SettingsProvider>
											</UserProvider>
										</AuthProvider>
									</SWRProvider>
								</SnackbarProvider>
							</AlertProvider>
						</LightBoxProvider>
					</SafeAreaProvider>
				</ColorSchemeProvider>
			</MagicProvider>
		</GestureHandlerRootView>
	);
};
