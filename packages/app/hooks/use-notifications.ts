import { useMyInfo } from '@diversifiedfinance/app/hooks/api-hooks';
import {
	fetcher,
	useInfiniteListQuerySWR,
} from '@diversifiedfinance/app/hooks/use-infinite-list-query';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { useCallback, useMemo } from 'react';
import { NotificationType } from '@diversifiedfinance/types/diversified';
import { NotificationsResponse } from '@diversifiedfinance/types';

const isReachingEnd = (response: NotificationsResponse | null): boolean =>
	Boolean(response && response.cursor === null);

export const useNotifications = () => {
	const PAGE_SIZE = 30;
	const { isAuthenticated } = useUser();
	const { data: myInfoData } = useMyInfo();

	// careful while debugging the fetcher function
	// seems like exceptions are swallowed
	const notificationsFetcher = useCallback(
		(pageIndex: number, previousPageData: NotificationsResponse) => {
			if (isReachingEnd(previousPageData)) {
				return null;
			}
			if (pageIndex === 0) {
				return `/api/notifications?limit=${PAGE_SIZE}&cache_key=1`;
			}
			return isAuthenticated
				? `/api/notifications?cursor=${
						previousPageData?.cursor ?? ''
				  }&limit=${PAGE_SIZE}&cache_key=1`
				: null;
		},
		[isAuthenticated]
	);

	const queryState = useInfiniteListQuerySWR<NotificationsResponse>(
		notificationsFetcher,
		{
			pageSize: PAGE_SIZE,
			isReachingEnd,
			swr: {
				fetcher,
				revalidateOnMount: true,
			},
		}
	);

	const newData = useMemo(() => {
		let newData: NotificationType[] = [];
		if (queryState.data) {
			queryState.data.forEach(({ data }) => {
				if (data && data.length > 0) {
					newData = newData.concat(data);
				}
			});
		}
		return newData;
	}, [queryState.data]);

	const visibleNotifications = newData.filter(
		(item) => item.type !== 'system' && !item.type.startsWith('special_')
	);

	const hasUnreadNotification = useMemo(() => {
		if (
			visibleNotifications?.[0] &&
			myInfoData?.data?.profile &&
			(!myInfoData.data.profile.notificationsLastOpened ||
				new Date(visibleNotifications[0].visibleAt) >
					new Date(myInfoData.data.profile.notificationsLastOpened))
		) {
			return true;
		}

		return false;
	}, [visibleNotifications, myInfoData]);

	return {
		...queryState,
		data: newData,
		visibleNotifications,
		hasUnreadNotification,
	};
};
