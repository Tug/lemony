import React, {
	createContext,
	useState,
	useCallback,
	useEffect,
	useRef,
} from 'react';
import {
	AuthService,
	AuthServiceConfig,
} from '@diversifiedfinance/app/lib/auth-service/auth-service';
import authService from './auth-service';
import { OtpOverlay } from './otp-overlay';

export interface AuthServiceContext {
	isOverlayVisible: boolean;
	onCodeEntered: (code: string) => void;
	onPhoneEdited: (phoneNumber: string) => void;
	onCancel: () => void;
	channel: 'sms' | 'email' | null;
	authService: AuthService;
	auth: {
		loginWithEmail: ({ email }: { email: string }) => Promise<string>;
		loginWithSMS: ({
			phoneNumber,
		}: {
			phoneNumber: string;
		}) => Promise<string>;
		tryAgain: (errorMessage?: string) => Promise<string>;
	};
	Relayer: React.ComponentType;
}

export const AuthServiceContext = createContext<AuthServiceContext>();

export const AuthServiceProvider = ({
	config,
	children,
}: {
	config?: AuthServiceConfig;
	children: React.ReactNode;
}) => {
	const [isOverlayVisible, setOverlayVisible] = useState(false);
	const channel = useRef<'sms' | 'email' | null>(null);
	const [otpPromise, setOtpPromise] = useState<{
		resolve: (value: string) => void;
		reject: (reason?: any) => void;
	} | null>(null);

	useEffect(() => {
		authService.setConfig(config);
	}, [config]);

	const loginWithSMS = useCallback(
		async ({ phoneNumber }: { phoneNumber: string }): Promise<string> => {
			channel.current = 'sms';
			await authService.loginWithSMS({ phoneNumber });
			setOverlayVisible(true);
			return new Promise<string>((resolve, reject) => {
				setOtpPromise({ resolve, reject });
			});
		},
		[]
	);

	const loginWithEmail = useCallback(
		async ({ email }: { email: string }): Promise<string> => {
			channel.current = 'email';
			await authService.loginWithEmail({ email });
			setOverlayVisible(true);
			return new Promise<string>((resolve, reject) => {
				setOtpPromise({ resolve, reject });
			});
		},
		[]
	);

	const tryAgain = useCallback(async (errorMessage?: string) => {
		const userMetadata = authService.user.getMetadata();
		authService.lastError = errorMessage;
		if (
			(channel.current === 'sms' && userMetadata.phoneNumber) ||
			(channel.current === 'email' && userMetadata.email)
		) {
			setOverlayVisible(true);
			return new Promise<string>((resolve, reject) => {
				setOtpPromise({ resolve, reject });
			});
		}
		throw new Error('Cannot try again. Please restart auth flow.');
	}, []);

	const onCodeEntered = useCallback(
		(code: string) => {
			if (otpPromise) {
				otpPromise.resolve(code);
			}
			setOverlayVisible(false);
		},
		[otpPromise]
	);

	const onPhoneEdited = useCallback(
		(phoneNumber: string) => authService.loginWithSMS({ phoneNumber }),
		[]
	);

	const onCancel = useCallback(() => {
		if (otpPromise) {
			otpPromise.reject(new Error('OTP Cancelled'));
		}
		setOverlayVisible(false);
		channel.current = null;
	}, [otpPromise]);

	return (
		<AuthServiceContext.Provider
			value={{
				authService,
				auth: {
					loginWithEmail,
					loginWithSMS,
					tryAgain,
				},
				channel: channel.current,
				isOverlayVisible,
				onCodeEntered,
				onPhoneEdited,
				onCancel,
				Relayer: OtpOverlay,
			}}
		>
			{children}
		</AuthServiceContext.Provider>
	);
};
