import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { axios } from '@diversifiedfinance/app/lib/axios';

import { fetcher } from './use-infinite-list-query';

export function usePushNotificationsPreferences() {
	const { data, error, mutate, isLoading } = useSWR<any>(
		'/api/notifications/preferences/push',
		fetcher
	);

	return {
		data,
		loading: !data,
		isLoading,
		error,
		refresh: mutate,
	};
}

async function editPushSettings(
	url: string,
	{ arg }: { arg: { pushKey: any; pushValue: boolean } }
) {
	return axios({
		url: `/api/notifications/preferences/push`,
		method: 'PATCH',
		data: {
			[arg.pushKey]: arg.pushValue,
		},
	});
}

export const useEditPushNotificationsPreferences = () => {
	const { trigger, isMutating, error } = useSWRMutation(
		`/api/notifications/preferences/push`,
		editPushSettings
	);

	return {
		trigger,
		isMutating,
		error,
	};
};
