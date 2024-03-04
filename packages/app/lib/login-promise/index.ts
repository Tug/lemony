import { useAuth } from '@diversifiedfinance/app/hooks/auth/use-auth';
import { useStableCallback } from '@diversifiedfinance/app/hooks/use-stable-callback';
import { useNavigateToLogin } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';

export const loginPromiseCallbacks = {
	resolve: null as ((v: unknown) => void) | null,
	reject: null as ((v: unknown) => void) | null,
};

export const useLogInPromise = () => {
	const { accessToken } = useAuth();
	const navigateToLogin = useNavigateToLogin();
	const loginPromise = useStableCallback(
		() =>
			new Promise((resolve, reject) => {
				if (accessToken) {
					resolve(true);
				} else {
					navigateToLogin();
					loginPromiseCallbacks.resolve = resolve;
					loginPromiseCallbacks.reject = reject;
				}
			})
	);

	return {
		loginPromise,
	};
};
