import { useAccessTokenManager } from '@diversifiedfinance/app/hooks/auth/use-access-token-manager';
import { useIsOnline } from '@diversifiedfinance/app/hooks/use-is-online';
import { isUndefined } from '@diversifiedfinance/app/lib/swr/helper';
import { toast } from '@diversifiedfinance/design-system/toast';
import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import type { Revalidator, RevalidatorOptions } from 'swr';
import { SWRConfig } from 'swr';
import type { PublicConfiguration } from 'swr/_internal';
import type { AxiosError } from 'axios';

import { setupSWRCache } from './swr-cache';
import { deleteRefreshToken } from '@diversifiedfinance/app/lib/refresh-token';
import { deleteAccessToken } from '@diversifiedfinance/app/lib/access-token';

function mmkvProvider() {
	const storage = new MMKV();
	const { swrCacheMap, persistCache } = setupSWRCache({
		set: storage.set.bind(storage),
		get: storage.getString.bind(storage),
	});

	AppState.addEventListener(
		'change',
		function persistCacheOnAppBackground(s) {
			if (s === 'background') {
				persistCache();
			}
		}
	);

	return swrCacheMap;
}

export const SWRProvider = ({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element => {
	const { refreshTokens } = useAccessTokenManager();
	const { isOnline } = useIsOnline();

	return (
		<SWRConfig
			value={{
				provider: mmkvProvider,
				onError: (err) => {
					if (err?.message && __DEV__) {
						console.error(err, err.stack);
						toast.error(err.message);
					}
				},
				onErrorRetry: async (
					error: AxiosError,
					key: string,
					config: Readonly<PublicConfiguration>,
					revalidate: Revalidator,
					opts: Required<RevalidatorOptions>
				) => {
					// bail out immediately if the error is unrecoverable
					if (
						error.response?.status === 400 ||
						error.response?.status === 403 ||
						error.response?.status === 404
					) {
						return;
					}

					const maxRetryCount = config.errorRetryCount;
					const currentRetryCount = opts.retryCount;

					if (error.response?.status === 401) {
						// we only want to refresh tokens once and then bail out if it fails on 401
						// this is to prevent infinite loops.
						// logout the user
						if (currentRetryCount > 2) {
							deleteRefreshToken();
							deleteAccessToken();
							return;
						}
						try {
							await refreshTokens();
						} catch (err) {
							return;
						}
					}

					// Exponential backoff
					const timeout =
						~~(
							(Math.random() + 0.5) *
							(1 <<
								(currentRetryCount < 8 ? currentRetryCount : 8))
						) * config.errorRetryInterval;

					if (
						!isUndefined(maxRetryCount) &&
						currentRetryCount > maxRetryCount
					) {
						return;
					}

					setTimeout(revalidate, timeout, opts);
				},
				isVisible: () => {
					return AppState.currentState === 'active';
				},
				isOnline: () => {
					return isOnline;
				},
				// TODO: tab focus too
				initFocus(callback) {
					const onAppStateChange = (nextAppState: AppStateStatus) => {
						/* If it's resuming from background or inactive mode to active one */
						if (nextAppState === 'active') {
							callback();
						}
					};

					// Subscribe to the app state change events
					const listener = AppState.addEventListener(
						'change',
						onAppStateChange
					);

					return () => {
						if (listener) {
							listener.remove();
						}
					};
				},
				initReconnect(callback) {
					const unsubscribe = NetInfo.addEventListener((s) => {
						if (s.isInternetReachable && s.isConnected) {
							callback();
						}
					});

					return unsubscribe;
				},
			}}
		>
			{children}
		</SWRConfig>
	);
};