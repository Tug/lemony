import { useEffect, useState } from 'react';

import * as WebBrowser from 'expo-web-browser';

import { Spinner } from '@diversifiedfinance/design-system/spinner';
import { View } from '@diversifiedfinance/design-system/view';
import { Text } from '@diversifiedfinance/design-system/text';

const urlParams = new URLSearchParams(
	typeof window !== 'undefined' ? window.location.search : ''
);

const EmailAuthRedirect = () => {
	const phoneNumber = urlParams.get('phoneNumber');
	const token = urlParams.get('token');
	const [invalidCode, setInvalidCode] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (token) {
			WebBrowser.maybeCompleteAuthSession();
			setLoading(true);
		}
	}, []);

	if (loading) {
		return (
			<View tw="flex-1 items-center justify-center">
				<Spinner size="large" />
			</View>
		);
	}

	if (!token) {
		return (
			<View>
				<Text>Invalid Token</Text>
			</View>
		);
	}

	return null;
};

EmailAuthRedirect.getLayout = (page) => page;

export default EmailAuthRedirect;
