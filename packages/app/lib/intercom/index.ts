import Intercom, {
	Space,
	IntercomEvents,
	Content,
} from '@intercom/intercom-react-native';
import { MyInfo, Profile } from '@diversifiedfinance/types/diversified';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { profileToIntercomUserData } from '@diversifiedfinance/app/lib/intercom/common';
import { useCallback } from 'react';
import { atom, useAtom, createStore } from 'jotai';
import { useFeature } from '@growthbook/growthbook-react';

export { Space, IntercomEvents };

export const updateUser = async (user: MyInfo): Promise<boolean> => {
	if (!user?.data.profile || !user?.data.profile.profile_id) {
		return false;
	}
	if (user?.data.providers.intercom?.userHash) {
		await Intercom.setUserHash(user?.data.providers.intercom?.userHash);
	}
	return Intercom.updateUser(profileToIntercomUserData(user?.data.profile));
};

export const login = async (user: MyInfo): Promise<boolean> => {
	if (!user?.data.profile || !user?.data.profile.profile_id) {
		return false;
	}
	try {
		await logout();
	} catch (err) {
		// ignore error
	}
	if (user?.data.providers.intercom?.userHash) {
		await Intercom.setUserHash(user?.data.providers.intercom?.userHash);
	}
	return await Intercom.loginUserWithUserAttributes(
		profileToIntercomUserData(user?.data.profile)
	);
};

const isLoggedInInitial = atom(false);
// TODO NEXT: add intercom store to a provider,
//  should be fine for now as logout should for unmount
//  all components that calls useIntercom
const intercomStore = createStore();

export const logout = async () => {
	await Intercom.logout();
	intercomStore.set(isLoggedInInitial, false);
};

export const useIntercom = () => {
	const { user } = useUser();
	const isDisabled = useFeature('intercom').off;
	const [isLoggedIn, setLoggedIn] = useAtom(isLoggedInInitial);

	const authUser = useCallback(async () => {
		if (!user?.data.profile) {
			throw new Error('User is not logged in');
		}
		if (isLoggedIn) {
			await updateUser(user);
		} else {
			try {
				await login(user);
				setLoggedIn(true);
			} catch (err) {
				if (__DEV__) {
					console.log(err);
				}
			}
		}
	}, [user?.data.profile, isLoggedIn, setLoggedIn]);

	return {
		isEnabled: !isDisabled,
		Intercom,
		login: authUser,
		logout,
		updateUser,
		show: async (space: Space = Space.home): Promise<void> => {
			if (!isLoggedIn) {
				await authUser();
			}
			// on android presentSpace never resolves...
			Intercom.presentSpace(space);
			let resolved = false;
			return new Promise((resolve) => {
				const listener = Intercom.addEventListener(
					IntercomEvents.IntercomWindowDidHide,
					() => {
						if (!resolved) {
							resolved = true;
							// Bug in library listener.remove calls itself and causes:
							// RangeError: Maximum call stack size exceeded
							// There's a patch for this in this repo
							listener.remove();
							resolve();
						}
					}
				);
			});
		},
		showContent: async (content: Content): Promise<void> => {
			// Make sure the user's locale is in sync with intercom
			try {
				await updateUser(user);
			} catch (err) {
				// ignore error
			}
			await Intercom.presentContent(content);
		},
	};
};
