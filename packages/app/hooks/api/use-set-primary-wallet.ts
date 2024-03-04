import { axios } from '@diversifiedfinance/app/lib/axios';
import { MY_INFO_ENDPOINT } from '@diversifiedfinance/app/hooks/api-hooks';
import { useSWRConfig } from 'swr';

let onPrimaryWalletSetCallback: any = null;

export const setPrimaryWalletSuccessCallback = (cb?: Function) => {
	onPrimaryWalletSetCallback = cb;
};
export const useSetPrimaryWallet = () => {
	const { mutate } = useSWRConfig();

	const setPrimaryWallet = async (address: string) => {
		mutate(MY_INFO_ENDPOINT, async () => {
			await axios({
				url: `/api/wallet/${address}/primary`,
				method: 'PATCH',
				data: {},
			});
			onPrimaryWalletSetCallback?.();
			onPrimaryWalletSetCallback = null;
		});
	};

	return { setPrimaryWallet };
};
