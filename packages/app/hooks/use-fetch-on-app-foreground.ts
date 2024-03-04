import { axios, AxiosParams } from '@diversifiedfinance/app/lib/axios';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useFetchOnAppForeground = () => {
	const subscription = useRef<any>(null);

	function fetchOnAppForeground(params: AxiosParams) {
		if (AppState.currentState === 'active') {
			return axios(params);
		}
		return new Promise<any>((resolve, reject) => {
			function fetchData(state: AppStateStatus) {
				if (state === 'active') {
					console.log('calling foreground fetch');
					axios(params).then(resolve).catch(reject);
					subscription.current?.remove();
					subscription.current = null;
				}
			}

			subscription.current = AppState.addEventListener(
				'change',
				fetchData
			);
		});
	}

	useEffect(() => {
		return () => {
			subscription.current?.remove();
		};
	}, []);

	return fetchOnAppForeground;
};
