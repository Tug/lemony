import { hasNotAcceptedTerms, isProfileIncomplete } from '../utilities';
import { UserContext } from '@diversifiedfinance/app/context/user-context';
import { useAuth } from '@diversifiedfinance/app/hooks/auth/use-auth';
// Disabling this for now just to be sure. See:
// https://github.com/expo/expo/issues/15788
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useEffect, useMemo, ReactNode, useRef } from 'react';
import { useMyInfo } from '@diversifiedfinance/app/hooks/api-hooks';
import { registerForPushNotificationsAsync } from '@diversifiedfinance/app/lib/register-push-notification';
import { Analytics } from '@diversifiedfinance/app/lib/analytics';

interface UserProviderProps {
	children: ReactNode;
}

// TODO NEXT: update this provider
export function UserProvider({ children }: UserProviderProps) {
	const { authenticationStatus, accessToken, logout } = useAuth();
	const router = useRouter();
	const { data, error, mutate } = useMyInfo();
	const isFirstLoad = useRef(true);
	const isLoading =
		authenticationStatus === 'IDLE' ||
		authenticationStatus === 'REFRESHING' ||
		(authenticationStatus === 'AUTHENTICATED' && !error && !data);
	const isIncompletedProfile = isProfileIncomplete(data?.data?.profile);
	const isTermsNotAccepted = hasNotAcceptedTerms(data?.data?.profile);
	const isVerifiedProfile = data?.data?.profile
		? Boolean(data?.data?.profile.kycStatus === 'completed')
		: undefined;
	const isFailedKYC = data?.data?.profile.kycStatus === 'failed';
	const userContextValue = useMemo(
		() => ({
			user: data,
			mutate,
			error,
			isLoading,
			isAuthenticated: Boolean(accessToken),
			isIncompletedProfile,
			isTermsNotAccepted,
			isVerifiedProfile,
			isFailedKYC,
		}),
		[isLoading, data, accessToken, mutate, error, isIncompletedProfile]
	);

	useEffect(() => {
		if (
			authenticationStatus === 'AUTHENTICATED' ||
			authenticationStatus === 'UNAUTHENTICATED'
		) {
			mutate();
		}

		if (authenticationStatus === 'UNAUTHENTICATED') {
			isFirstLoad.current = true;
		}
	}, [authenticationStatus, mutate, router]);

	useEffect(() => {
		if (data?.data?.profile) {
			Analytics.identify(data.data.profile);
		}
	}, [data?.data?.profile]);

	useEffect(() => {
		if (
			authenticationStatus === 'AUTHENTICATED' &&
			error &&
			error.message === 'Unauthorized'
		) {
			logout();
		}
	}, [error, logout, authenticationStatus]);

	useEffect(() => {
		const identifyAndRegisterPushNotification = async () => {
			if (data) {
				await registerForPushNotificationsAsync();
			}
		};

		identifyAndRegisterPushNotification();
	}, [data]);

	return (
		<UserContext.Provider value={userContextValue}>
			{children}
		</UserContext.Provider>
	);
}
