import { axios } from '@diversifiedfinance/app/lib/axios';
import { useState, useEffect } from 'react';
import type { KeyedMutator } from 'swr';
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite';

export const fetcher = (url: string) => {
	return axios({
		url,
		method: 'GET',
	});
};

export const swrFetcher = (url: string) => {
	return axios({
		url,
		method: 'GET',
		overrides: { disableAccessTokenAuthorization: true },
	});
};

type UseInfiniteListQueryReturn<T> = {
	error?: string;
	data?: Array<T>;
	isLoading: boolean;
	isRefreshing: boolean;
	isLoadingMore: boolean;
	isReachingEnd: boolean;
	fetchMore: () => void;
	refresh: () => void;
	retry: () => void;
	mutate: KeyedMutator<T[]>;
};
type UseInfiniteListConfig<T> = {
	refreshInterval?: number;
	pageSize?: number;
	isReachingEnd?: (lastPage?: T) => boolean;
	swr?: Partial<SWRInfiniteConfiguration<T>>;
};
export const useInfiniteListQuerySWR = <T>(
	urlFunction: (pageIndex: number, previousPageData: T) => string | null,
	config?: UseInfiniteListConfig<T>
): UseInfiniteListQueryReturn<T> => {
	const refreshInterval = config?.refreshInterval ?? 0;
	const PAGE_SIZE = config?.pageSize ?? 0;
	// Todo:: on Refresh, swr will refetch all the page APIs. This may appear weird at first, but I guess could be better for UX
	// We don't want to show loading indicator till all of the requests succeed, so we'll add our refreshing state
	// and set it to false even when first request is completed.
	const [isRefreshing, setRefreshing] = useState(false);
	const { data, error, mutate, size, setSize, isValidating, isLoading } =
		useSWRInfinite<T>(urlFunction, config?.swr?.fetcher ?? swrFetcher, {
			revalidateFirstPage: true,
			// suspense: true,
			refreshInterval,
			revalidateOnMount: true,
			dedupingInterval: 5000,
			focusThrottleInterval: 30000,
			...config?.swr,
		});

	const isRefreshingSWR = isValidating && data && data.length === size;
	const isLoadingInitialData = !data && !error;
	const isLoadingMore =
		(isLoadingInitialData ||
			(size > 0 && data && typeof data[size - 1] === 'undefined')) ??
		false;
	const isEmpty = (data?.[0] as any)?.length === 0;

	const isReachingEndDefault = !PAGE_SIZE
		? true
		: isEmpty ||
		  ((data && (data[data.length - 1] as any)?.length < PAGE_SIZE) ??
				true);
	const isReachingEnd = config?.isReachingEnd
		? config.isReachingEnd(data && data[data.length - 1])
		: isReachingEndDefault;

	useEffect(() => {
		if (!isRefreshingSWR) {
			setRefreshing(false);
		}
	}, [isRefreshingSWR]);

	const fetchMore = () => {
		if (isLoadingMore || isReachingEnd) return;
		setSize((currentSize) => currentSize + 1);
	};

	return {
		data,
		error,
		refresh: () => {
			setRefreshing(true);
			mutate();
			// hide refresh indicator in max 4 seconds due to above reason
			setTimeout(() => {
				setRefreshing(false);
			}, 4000);
		},
		fetchMore,
		retry: mutate,
		isLoading,
		isLoadingMore,
		isRefreshing,
		mutate,
		isReachingEnd,
	};
};
