import { axios } from '../axios';

export const fetchNonce = (address) => {
	return axios({
		url: `/api/wallet/${address}/nonce`,
		method: 'GET',
	});
};
