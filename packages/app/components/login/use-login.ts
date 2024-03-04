import { useAuth } from '@diversifiedfinance/app/hooks/auth/use-auth';
import { useOTPLogin } from '@diversifiedfinance/app/hooks/auth/use-otp-login';
import { useStableBlurEffect } from '@diversifiedfinance/app/hooks/use-stable-blur-effect';
import { Analytics, EVENTS } from '@diversifiedfinance/app/lib/analytics';
import { captureException } from '@diversifiedfinance/app/lib/sentry';
import { useCallback, useEffect, useRef } from 'react';
import { useMagicLogin } from '@diversifiedfinance/app/hooks/auth/use-magic-login';
import { useFeature } from '@growthbook/growthbook-react';

type LoginSource = 'undetermined' | 'otp';

export const useLogin = (onLogin?: () => void, fromModal: boolean = false) => {
	const loginSource = useRef<LoginSource>('undetermined');

	const { authenticationStatus, setAuthenticationStatus, logout } = useAuth();
	const isOTP = useFeature('twilio-otp-login').on;
	const otpLoginMethods = useOTPLogin();
	const magicLoginMethods = useMagicLogin();
	const { loginWithEmail, loginWithPhoneNumber } = isOTP
		? otpLoginMethods
		: magicLoginMethods;

	const handleLoginFailure = useCallback(
		function handleLoginFailure(error: unknown) {
			loginSource.current = 'undetermined';
			setAuthenticationStatus('UNAUTHENTICATED');

			if (process.env.NODE_ENV === 'development' || __DEV__) {
				// eslint-disable-next-line no-console
				console.error(error, error?.stack);
			}

			// let errMessage = String(error);
			// if (error instanceof Error) {
			// 	errMessage =
			// 		(error.isAxiosError && error.response?.data?.error) ??
			// 		error.message;
			// }

			captureException(error, {
				tags: {
					login_signature_flow: 'use-login.ts',
					login_magic_link: 'use-login.ts',
				},
			});
		},
		[setAuthenticationStatus]
	);

	const handleSubmitEmail = useCallback(
		async function handleSubmitEmail(email: string, extraData?: any) {
			try {
				loginSource.current = 'otp';
				Analytics.track(EVENTS.BUTTON_CLICKED, {
					name: 'Login with email',
				});

				return await loginWithEmail(email, extraData);
			} catch (error) {
				handleLoginFailure(error);
			}
		},
		[loginWithEmail, handleLoginFailure]
	);
	const handleSubmitPhoneNumber = useCallback(
		async function handleSubmitPhoneNumber(
			phoneNumber: string,
			extraData?: any
		) {
			try {
				loginSource.current = 'otp';
				Analytics.track(EVENTS.BUTTON_CLICKED, {
					name: 'Login with phone number',
				});

				return await loginWithPhoneNumber(phoneNumber, extraData);
			} catch (error) {
				handleLoginFailure(error);
			}
		},
		[loginWithPhoneNumber, handleLoginFailure]
	);

	/**
	 * We make sure to prevent/stop the authentication state,
	 * when customer closes the login modal.
	 */
	const handleBlur = useCallback(() => {
		if (!fromModal) {
			return;
		}
		// @ts-ignore
		loginSource.current = undefined;

		if (authenticationStatus === 'AUTHENTICATING') {
			// eslint-disable-next-line no-console
			console.log(
				'still authenticating and modal is blurred, logging out'
			);
			logout();
		}
	}, [/*logout, */ authenticationStatus, fromModal]);

	useStableBlurEffect(handleBlur);
	useEffect(() => {
		const isAuthenticated = authenticationStatus === 'AUTHENTICATED';
		const isLoggedInByMagic =
			loginSource.current === 'otp' && isAuthenticated;

		if (__DEV__) {
			console.log(
				'authentication status changed',
				authenticationStatus,
				loginSource.current
			);
		}

		if (isLoggedInByMagic) {
			onLogin?.();
		}
	}, [authenticationStatus, onLogin]);

	return {
		authenticationStatus,
		loading: authenticationStatus === 'AUTHENTICATING',
		handleSubmitEmail,
		handleSubmitPhoneNumber,
	};
};
