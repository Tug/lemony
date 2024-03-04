import { useAuth } from './use-auth';
import { useCallback } from 'react';
import { useAuthService } from '@diversifiedfinance/app/lib/auth-service';
import { toast } from '@diversifiedfinance/design-system/toast';

export const LOGIN_OTP_ENDPOINT = 'otp';

export function useOTPLogin() {
	const { setAuthenticationStatus, login, logout } = useAuth();
	const { auth } = useAuthService();

	const tryLogin = useCallback(
		async (loginPayload: any) => {
			setAuthenticationStatus('AUTHENTICATING');
			try {
				await login(LOGIN_OTP_ENDPOINT, loginPayload);
			} catch (error) {
				if (error?.message === 'OTP Cancelled') {
					return;
				}
				if (error?.response?.data?.name === 'LoginError') {
					toast.error(error?.response?.data?.error, {
						duration: 7000,
					});
					if (error?.response?.data?.type === 'INVALID_CODE') {
						const code = await auth.tryAgain(
							error?.response?.data?.error
						);
						await tryLogin({
							...loginPayload,
							code,
						});
						return;
					}
				}
				// logout returns to the onboarding home page
				// we should avoid that
				logout();
				throw error;
			}
		},
		[login, logout, auth, setAuthenticationStatus]
	);

	const loginWithPhoneNumber = useCallback(
		async function loginWithPhoneNumber(
			phoneNumber: string,
			extraData?: any
		) {
			setAuthenticationStatus('AUTHENTICATING');
			try {
				const code = await auth.loginWithSMS({
					phoneNumber,
				});

				await tryLogin({
					code,
					phoneNumber,
					...extraData,
				});
			} catch (error) {
				throw error;
			}
		},
		[tryLogin, auth, setAuthenticationStatus]
	);

	const loginWithEmail = useCallback(
		async function loginWithEmail(email: string, extraData?: any) {
			setAuthenticationStatus('AUTHENTICATING');

			try {
				const code = await auth.loginWithEmail({
					email,
				});

				await tryLogin({
					code,
					email,
					...extraData,
				});
			} catch (error) {
				throw error;
			}
		},
		[tryLogin, auth, setAuthenticationStatus]
	);

	return {
		loginWithPhoneNumber,
		loginWithEmail,
	};
}
