import { useAccessTokenManager } from '@diversifiedfinance/app/hooks/auth/use-access-token-manager';
import { isServer } from '@diversifiedfinance/app/lib/is-server';
import { isUndefined } from '@diversifiedfinance/app/lib/swr/helper';
import { toast } from '@diversifiedfinance/design-system/toast';
import type { Revalidator, RevalidatorOptions } from 'swr';
import { SWRConfig } from 'swr';
import type { SWRConfiguration } from 'swr';
import type { AxiosError } from 'axios';

import { setupSWRCache } from './swr-cache';

const localStorageProvider = () => {
	const { swrCacheMap, persistCache } = setupSWRCache({
		set: localStorage.setItem.bind(localStorage),
		get: localStorage.getItem.bind(localStorage),
	});

	window.addEventListener('beforeunload', persistCache);

	return swrCacheMap;
};

export const SWRProvider = ({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element => {
	const { refreshTokens } = useAccessTokenManager();

	return (
		<SWRConfig
			value={{
				provider: isServer ? () => new Map() : localStorageProvider,
				onError: (err) => {
					if (
						__DEV__ &&
						err?.message &&
						err?.message !== 'canceled'
					) {
						console.error(err);
						toast.error(err.message);
					}
				},
				onErrorRetry: async (
					error: AxiosError,
					key: string,
					config: Readonly<SWRConfiguration>,
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

					if (error.status === 401) {
						await refreshTokens();
					}

					setTimeout(revalidate, timeout, opts);
				},
			}}
		>
			{children}
		</SWRConfig>
	);
};