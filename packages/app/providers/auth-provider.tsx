import { axios } from '@diversifiedfinance/app/lib/axios';
import {
	MY_INFO_ENDPOINT,
	USER_SETTINGS_ENDPOINT,
} from '@diversifiedfinance/app/hooks/api-hooks';
import { AuthContext } from '@diversifiedfinance/app/context/auth-context';
import { useAccessTokenManager } from '@diversifiedfinance/app/hooks/auth/use-access-token-manager';
import { useFetchOnAppForeground } from '@diversifiedfinance/app/hooks/use-fetch-on-app-foreground';
import * as accessTokenStorage from '@diversifiedfinance/app/lib/access-token';
import {
	deleteAccessToken,
	useAccessToken,
} from '@diversifiedfinance/app/lib/access-token';
import { deleteAppCache } from '@diversifiedfinance/app/lib/delete-cache';
import * as loginStorage from '@diversifiedfinance/app/lib/login';
import * as logoutStorage from '@diversifiedfinance/app/lib/logout';
import { useMagic } from '@diversifiedfinance/app/lib/magic';
import { deleteRefreshToken } from '@diversifiedfinance/app/lib/refresh-token';
import type { AuthenticationStatus } from '@diversifiedfinance/types';
import { Analytics, EVENTS } from '@diversifiedfinance/app/lib/analytics';
import { loginPromiseCallbacks } from '@diversifiedfinance/app/lib/login-promise';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useState,
	useRef,
} from 'react';
import { AppState, Platform } from 'react-native';
import { useSWRConfig } from 'swr';
import { useNavigateToScreen } from '../navigation/lib/use-navigate-to';
import { MyInfo } from '@diversifiedfinance/types/diversified';
import * as intercom from '@diversifiedfinance/app/lib/intercom';
import { AuthServiceProvider } from '@diversifiedfinance/app/lib/auth-service/auth-service-provider';

interface AuthProviderProps {
	children: React.ReactNode;
	onWagmiDisconnect?: () => void;
}

// 6 hours
const REFRESH_TOKEN_MAX_INTERVAL_MILLISECONDS = 8 * 60 * 60 * 1000;

export function AuthProvider({
	children,
	onWagmiDisconnect,
}: AuthProviderProps) {
	const initialRefreshTokenRequestSent = useRef(false);
	const lastRefreshTokenSuccessTimestamp = useRef<number | null>(null);
	const appState = useRef(AppState.currentState);

	const [authenticationStatus, setAuthenticationStatus] =
		useState<AuthenticationStatus>(() =>
			accessTokenStorage.getAccessToken() ? 'AUTHENTICATED' : 'IDLE'
		);

	const { mutate } = useSWRConfig();
	const { magic } = useMagic();
	const { setTokens, refreshTokens } = useAccessTokenManager();
	const fetchOnAppForeground = useFetchOnAppForeground();
	const navigateToScreen = useNavigateToScreen();

	const login = useCallback(
		async function login(endpoint: string, data: object): Promise<MyInfo> {
			const response = await fetchOnAppForeground({
				url: `/api/token/${endpoint}`,
				method: 'POST',
				data,
			});
			console.log('login response', response);

			const accessToken = response?.access;
			const refreshToken = response?.refresh;
			const validResponse = accessToken && refreshToken;
			setAuthenticationStatus('REFRESHING');
			const res: MyInfo = await axios({
				url: MY_INFO_ENDPOINT,
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			// throw createError('Gateway timeout', {}, 504, {}, {});

			if (validResponse && res) {
				setTokens(accessToken, refreshToken);
				loginStorage.setLogin(Date.now().toString());
				mutate(MY_INFO_ENDPOINT, res);
				if (res.data.settings) {
					mutate(USER_SETTINGS_ENDPOINT, res.data.settings);
				}
				setAuthenticationStatus('AUTHENTICATED');
				Analytics.identify(res?.data?.profile);
				intercom.login(res);
				return res;
			}

			setAuthenticationStatus('UNAUTHENTICATED');
			throw new Error('Login failed');
		},
		[setTokens, setAuthenticationStatus, fetchOnAppForeground]
	);
	/**
	 * Log out the customer if logged in, and clear auth cache.
	 */
	const logout = useCallback(
		async function logout(redirect: boolean = true) {
			'';
			const wasUserLoggedIn = loginStorage.getLogin();
			if (wasUserLoggedIn && wasUserLoggedIn.length > 0) {
				Analytics.track(EVENTS.USER_LOGGED_OUT);
				Analytics.reset();
			}

			try {
				onWagmiDisconnect?.();
				loginStorage.deleteLogin();
				logoutStorage.setLogout(Date.now().toString());

				deleteAppCache();
				deleteRefreshToken();
				deleteAccessToken();

				magic?.user?.logout();

				setAuthenticationStatus('UNAUTHENTICATED');
				mutate(/* match all keys */ () => true, undefined, {
					revalidate: false,
				});
				intercom.logout();
			} catch (err) {
				console.error(err);
			} finally {
				if (redirect) {
					navigateToScreen(
						Platform.select({
							default: 'onboardingHome',
							web: 'home',
						})
					);
				}
			}
		},
		[onWagmiDisconnect, magic?.user, mutate, navigateToScreen]
	);
	const doRefreshToken = useCallback(async () => {
		setAuthenticationStatus('REFRESHING');
		try {
			await refreshTokens();
			setAuthenticationStatus('AUTHENTICATED');
			lastRefreshTokenSuccessTimestamp.current = new Date().getTime();
		} catch (error: any) {
			setAuthenticationStatus('UNAUTHENTICATED');
			// eslint-disable-next-line no-console
			console.error(
				'AuthProvider',
				typeof error === 'string' ? error : error.message || 'unknown'
			);
		}
	}, [refreshTokens, setAuthenticationStatus]);

	const accessToken = useAccessToken();
	const authenticationContextValue = useMemo(
		() => ({
			authenticationStatus,
			accessToken,
			setAuthenticationStatus,
			login,
			logout,
		}),
		[
			authenticationStatus,
			accessToken,
			setAuthenticationStatus,
			login,
			logout,
		]
	);

	useEffect(() => {
		if (!initialRefreshTokenRequestSent.current) {
			doRefreshToken();
			initialRefreshTokenRequestSent.current = true;
		}
		const subscription = AppState.addEventListener(
			'change',
			(nextAppState) => {
				if (
					appState.current.match(/inactive|background/) &&
					nextAppState === 'active'
				) {
					// Re-request refresh token after 6 hours
					if (
						lastRefreshTokenSuccessTimestamp.current &&
						new Date().getTime() -
							lastRefreshTokenSuccessTimestamp.current >
							REFRESH_TOKEN_MAX_INTERVAL_MILLISECONDS
					) {
						doRefreshToken();
					}
				}

				appState.current = nextAppState;
			}
		);

		return () => {
			subscription.remove();
		};
	}, [doRefreshToken]);

	useEffect(() => {
		if (authenticationStatus === 'AUTHENTICATED') {
			loginPromiseCallbacks.resolve?.(true);
			loginPromiseCallbacks.resolve = null;
		}
	}, [authenticationStatus]);

	return (
		<AuthServiceProvider>
			<AuthContext.Provider value={authenticationContextValue}>
				{children}
			</AuthContext.Provider>
		</AuthServiceProvider>
	);
}
