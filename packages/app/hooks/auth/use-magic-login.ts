import { useAuth } from './use-auth';
import { useMagic } from '@diversifiedfinance/app/lib/magic';
import { useCallback, useEffect } from 'react';

export const LOGIN_MAGIC_ENDPOINT = 'magic';

export function useMagicLogin() {
	const { authenticationStatus, setAuthenticationStatus, login, logout } =
		useAuth();
	const { magic } = useMagic();

	useEffect(() => {
		if (authenticationStatus === 'UNAUTHENTICATED') {
			try {
				magic?.user?.logout();
			} catch (err) {
				// ignore errors
			}
		}
	}, [magic, authenticationStatus]);

	const loginWithPhoneNumber = useCallback(
		async function loginWithPhoneNumber(
			phoneNumber: string,
			extraData?: any
		) {
			setAuthenticationStatus('AUTHENTICATING');
			try {
				const didToken = await magic.auth.loginWithSMS({
					phoneNumber,
				});

				await login(LOGIN_MAGIC_ENDPOINT, {
					didToken,
					phoneNumber,
					...extraData,
				});
			} catch (error) {
				logout();
				throw error;
			}
		},
		[magic, login, logout, setAuthenticationStatus]
	);

	const loginWithEmail = useCallback(
		async function loginWithEmail(email: string, extraData?: any) {
			setAuthenticationStatus('AUTHENTICATING');

			const didToken = await magic.auth.loginWithMagicLink({
				email,
			});

			try {
				await login(LOGIN_MAGIC_ENDPOINT, {
					didToken,
					email,
					...extraData,
				});
			} catch (error) {
				logout();
				throw error;
			}
		},
		[magic, login, logout, setAuthenticationStatus]
	);

	return {
		loginWithPhoneNumber,
		loginWithEmail,
	};
}
