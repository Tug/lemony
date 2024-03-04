import { useState } from 'react';
import { Platform } from 'react-native';

import * as WebBrowser from 'expo-web-browser';

import { useMagic } from '@diversifiedfinance/app/lib/magic';
import { OAUTH_REDIRECT_URI } from '@diversifiedfinance/app/utilities';

import { Logger } from '../logger';

export const useMagicSocialAuth = () => {
	const { magic } = useMagic();
	// Maybe move spotify auth here?
	const [loading, setLoading] = useState<'google' | 'apple' | null>(null);
	const [error, setError] = useState<string | null>(null);

	const performMagicAuthWithGoogle = async () => {
		const scope = ['email'];
		const redirectUri = OAUTH_REDIRECT_URI;
		setError(null);
		setLoading('google');

		return magic.oauth
			.loginWithPopup({
				provider: 'google',
				scope,
				redirectURI: redirectUri,
			})
			.catch((err) => {
				Logger.error(err);
				setError(err);
			})
			.finally(() => {
				setLoading(null);
			});
	};

	const performMagicAuthWithApple = async () => {
		const scope = ['email'];
		const redirectUri = OAUTH_REDIRECT_URI;
		setError(null);
		setLoading('apple');

		return magic.oauth
			.loginWithPopup({
				provider: 'apple',
				scope,
				redirectURI: redirectUri,
			})
			.catch((err) => {
				Logger.error(err);
				setError(err);
			})
			.finally(() => {
				setLoading(null);
			});
	};

	return {
		performMagicAuthWithApple,
		performMagicAuthWithGoogle,
		loading,
		error,
	};
};
