import { axios } from '@diversifiedfinance/app/lib/axios';
import { toast } from '@diversifiedfinance/design-system/toast';
import { useCallback } from 'react';
import { useSWRConfig } from 'swr';

type Report = {
	userId?: number;
	nftId?: number;
	activityId?: number;
	description?: string;
};

function useReport() {
	const { mutate } = useSWRConfig();

	const report = useCallback(
		async ({
			userId,
			nftId,
			activityId,
			description = '', // TODO: implement a modal to report with a description
		}: Report) => {
			await axios({
				url: `/v2/reportitem`,
				method: 'POST',
				data: {
					nft_id: nftId,
					description,
					activity_id: activityId,
					profile_id: userId,
				},
			});
			mutate(null);
			toast.success('Reported!');
		},
		[mutate]
	);

	return {
		report,
	};
}

export { useReport };
