import { useCallback, useEffect } from 'react';
import { axios } from '@diversifiedfinance/app/lib/axios';
import { useMyInfo } from '@diversifiedfinance/app/hooks/api-hooks';

export const useKycSync = (syncOnMount: boolean = true) => {
	const { data: user, mutate } = useMyInfo();
	const isKYCCompleted = user?.data.profile.kycStatus === 'completed';
	const sync = useCallback(() => {
		axios({ url: '/api/kyc/sync', method: 'GET' })
			.then(() => {
				mutate();
			})
			.catch(() => {
				// ignore error
			});
	}, [mutate]);

	useEffect(() => {
		if (syncOnMount && !isKYCCompleted) {
			sync();
		}
	}, [syncOnMount, sync, isKYCCompleted]);

	return sync;
};
