import React, { useCallback } from 'react';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import { Platform, StyleSheet, Modal } from 'react-native';
import OTPInputView from '@diversifiedfinance/components/otp-input-view';
import { useAuthService } from '@diversifiedfinance/app/lib/auth-service/auth';
import {
	View,
	Text,
	ScrollView,
	// Modal,
} from '@diversifiedfinance/design-system';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { useTranslation } from 'react-i18next';
import { Message, Messagev2 } from '@diversifiedfinance/design-system/icon';
import { CloseButton } from '@diversifiedfinance/app/components/close-button';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

export const OtpOverlay = () => {
	const { t } = useTranslation();
	const { isOverlayVisible, channel, onCodeEntered, onCancel, authService } =
		useAuthService();
	const { phoneNumber, email } = authService.user.getMetadata();
	const isDarkMode = useIsDarkMode();
	const { top } = useSafeAreaInsets();

	const onExit = useCallback(() => {
		authService?.reset?.();
		onCancel();
	}, [authService, onCancel]);

	return (
		<Modal
			visible={isOverlayVisible}
			onRequestClose={onExit}
			animationType="slide"
			transparent={Platform.OS === 'web'}
			statusBarTranslucent={Platform.OS === 'web'}
		>
			<ScrollView
				tw="flex-1 bg-white dark:bg-black"
				contentContainerStyle={{ alignItems: 'center' }}
			>
				<View tw="min-h-screen w-full items-center p-4">
					<View tw="absolute right-0 p-2" style={{ top }}>
						<CloseButton onPress={onExit} />
					</View>
					<View tw="mt-16 mb-4 items-center">
						{channel === 'sms' ? (
							<Message
								width={48}
								height={48}
								color={
									isDarkMode
										? colors.themeYellow
										: colors.diversifiedBlue
								}
							/>
						) : (
							<Messagev2
								width={48}
								height={48}
								color={
									isDarkMode
										? colors.themeYellow
										: colors.diversifiedBlue
								}
							/>
						)}
					</View>
					<View tw="my-2">
						<Text tw="text-lg font-inter text-black dark:text-white">
							{t('Enter the code we sent to')}
						</Text>
					</View>
					<View tw="mt-2 mb-8">
						<Text tw="text-lg font-bold font-inter text-black dark:text-white">
							{channel === 'sms' ? phoneNumber : email}
						</Text>
					</View>
					<View tw="my-4">
						<Text tw="text-xs text-gray-800 dark:text-gray-200">
							{channel === 'sms'
								? t(
										'Your phone will be used to protect your account each time you log in.'
								  )
								: t(
										'Your E-mail will be used to protect your account each time you log in.'
								  )}
						</Text>
					</View>
					<View tw="items-center">
						<View>
							{authService.lastError && (
								<Text tw="text-red-500">
									{authService.lastError}
								</Text>
							)}
						</View>
						<OTPInputView
							spaceBetweenGroups={30}
							style={{ width: 320, height: 70 }}
							pinCount={authService.config.pinCount ?? 6}
							autoFocusOnLoad
							codeInputFieldStyle={{
								width: 34,
								height: 42,
								borderWidth: 1,
								borderRadius: 8,
								color: isDarkMode ? 'white' : 'black',
								fontSize: 20,
								textAlign: 'left',
								letterSpacing: 20,
								paddingLeft: 10,
							}}
							selectionColor={
								isDarkMode
									? colors.themeYellow
									: colors.diversifiedBlue
							}
							codeInputHighlightStyle={{
								borderColor: isDarkMode
									? colors.themeYellow
									: colors.diversifiedBlue,
							}}
							onCodeFilled={onCodeEntered}
							firstInputProps={
								channel === 'sms' && Platform.OS === 'android'
									? {
											autoComplete: 'sms-otp',
									  }
									: {}
							}
						/>
					</View>
				</View>
			</ScrollView>
		</Modal>
	);
};
