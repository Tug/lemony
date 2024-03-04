import { Login } from './index';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import { useNavigationState } from '@diversifiedfinance/app/lib/react-navigation/native';
import { useNavigateToHome } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { createParam } from '@diversifiedfinance/app/navigation/lib/use-param';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';

type Query = {
	redirect_url: string;
	magic_credential: string;
};

const { useParam } = createParam<Query>();

export default function LoginModal() {
	const name = useNavigationState(({ routes }) => {
		return routes[0]?.name;
	});
	const navigateToHome = useNavigateToHome(true);
	useTrackPageViewed({ name });
	const [redirect_url] = useParam('redirect_url');
	// TODO: use useMagicAuthRedirect instead
	const [magic_credential] = useParam('magic_credential');
	const router = useRouter();
	const isSignup = name === 'signup';

	const handleOnLogin = useCallback(() => {
		if (redirect_url && redirect_url.length > 0) {
			if (Platform.OS !== 'web') {
				router.pop();
			}
			router.push(decodeURIComponent(redirect_url));
		} else {
			navigateToHome();
		}
	}, [redirect_url, router]);

	return (
		<Login
			onLogin={handleOnLogin}
			isSignup={isSignup}
			magicCredential={magic_credential}
		/>
	);
}
