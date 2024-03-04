import { axios } from '../axios';
import { CreateAccessTokenResponse } from '@sumsub/api-types';
import { TokenExpirationHandler } from '@sumsub/react-native-mobilesdk-module';

export const refreshToken: TokenExpirationHandler = () =>
	axios({
		url: '/api/kyc/token',
		method: 'POST',
	}).then(({ token }: CreateAccessTokenResponse) => token);
