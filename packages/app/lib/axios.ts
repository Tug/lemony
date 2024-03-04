import { getAccessToken } from '@diversifiedfinance/app/lib/access-token';
import axios from 'axios';
import type { Method, AxiosRequestHeaders } from 'axios';

export type AxiosOverrides = {
	forceAccessTokenAuthorization?: boolean;
	disableAccessTokenAuthorization?: boolean;
};

export type AxiosParams = {
	url: string;
	method: Method;
	data?: any;
	unmountSignal?: AbortSignal;
	overrides?: AxiosOverrides;
	headers?: AxiosRequestHeaders;
	params?: any;
};

const defaultHeaders = {
	'Content-type': 'Application/json',
	Accept: 'Application/json',
};

const axiosAPI = async ({
	url,
	method,
	data = {},
	unmountSignal,
	headers,
	overrides,
	params,
}: AxiosParams) => {
	const accessToken = getAccessToken();
	const forceAccessTokenAuthorization =
		overrides?.forceAccessTokenAuthorization;
	const disableAccessTokenAuthorization =
		overrides?.disableAccessTokenAuthorization;
	let authorizationHeader = accessToken ? `Bearer ${accessToken}` : null;

	if (forceAccessTokenAuthorization) {
		authorizationHeader = accessToken ? `Bearer ${accessToken}` : null;
	}

	if (disableAccessTokenAuthorization) {
		authorizationHeader = null;
	}

	const request = {
		baseURL: url.startsWith('http')
			? ''
			: process.env.NEXT_PUBLIC_BACKEND_URL,
		url,
		method,
		data: !method || method.toLowerCase() === 'get' ? null : data,
		signal: unmountSignal,
		...(authorizationHeader
			? {
					headers: {
						...defaultHeaders,
						Authorization: authorizationHeader,
						...headers,
					},
			  }
			: headers
			? {
					headers: {
						...defaultHeaders,
						...headers,
					},
			  }
			: {}),
		params,
	};

	if (__DEV__) {
		console.log(`${request.method} ${request.url}`);
	}

	try {
		return await axios(request).then((response) => {
			console.log(
				`${request.method} ${request.url}`,
				Boolean(process.env.VERBOSE)
					? `Response: ${JSON.stringify(response, null, 2)}`
					: ''
			);
			return response.data;
		});
	} catch (error: any) {
		// Logger.log('Failed request:', request);

		if (__DEV__) {
			const errorFromResponse =
				error.response?.data?.error?.message ??
				error.response?.data?.error;
			console.error(
				errorFromResponse ?? error.message,
				`${request.method} ${request.url}`,
				'Response: ',
				Boolean(process.env.VERBOSE)
					? JSON.stringify(error.response, null, 2)
					: JSON.stringify(error.response?.data, null, 2)
			);
		}

		throw error;
	}
};

if (__DEV__ && typeof window !== 'undefined') {
	window.axios = axiosAPI;
}

export { axiosAPI as axios };
