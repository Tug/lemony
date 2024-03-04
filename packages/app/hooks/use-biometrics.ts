import { useCallback, useEffect, useRef, useState } from 'react';
import { atom, useAtom } from 'jotai';
import { AppState, Platform } from 'react-native';

import * as LocalAuthentication from 'expo-local-authentication';
import { useAlert } from '@diversifiedfinance/design-system/alert';
import { useTranslation } from 'react-i18next';
import { usePreference } from '@diversifiedfinance/app/hooks/use-preference';

const isUserAuthenticatedAtom = atom(false);
const isBiometricsOverlayVisibleAtom = atom(true);

export const AuthenticationType = LocalAuthentication.AuthenticationType;

export const getIsBiometricsFeatureAvailable = async () => {
	const enrolledLevelAsync =
		await LocalAuthentication.getEnrolledLevelAsync();
	return enrolledLevelAsync !== LocalAuthentication.SecurityLevel.NONE;
};

/**
 * The time period for which is user not asked to be authenticated again if returns back to the app.
 */
const KEEP_LOGGED_IN_TIMEOUT = 10 * 60 * 1000; // 10 min

export const authenticate = async () => {
	const isBiometricsAvailable = await getIsBiometricsFeatureAvailable();

	if (isBiometricsAvailable) {
		const result = await LocalAuthentication.authenticateAsync();
		return result;
	}
};

export const useBiometrics = ({
	authenticateOnMount = true,
}: { authenticateOnMount?: boolean } = {}) => {
	const Alert = useAlert();
	const { t } = useTranslation();
	const { isBiometricsOptionEnabled } = useIsBiometricsEnabled();
	const { isUserAuthenticated, setIsUserAuthenticated } =
		useIsUserAuthenticated();
	const { setIsBiometricsOverlayVisible } = useIsBiometricsOverlayVisible();
	const appState = useRef(AppState.currentState);
	const [appStateVisible, setAppStateVisible] = useState(
		AppState.currentState
	);
	const goneToBackgroundAtTimestamp = useRef<null | number>(null);

	const handleAuthentication = useCallback(async () => {
		// Stop the authentication flow if the user leaves the app.
		if (appState.current !== 'active') {
			if (Platform.OS === 'android') {
				LocalAuthentication.cancelAuthenticate();
			}
			return;
		}

		if (isBiometricsOptionEnabled && !isUserAuthenticated) {
			const result = await authenticate();

			if (result && result?.success) {
				setIsUserAuthenticated(true);
				setIsBiometricsOverlayVisible(false);
			} else {
				handleAuthentication();
			}
		}
	}, [
		isBiometricsOptionEnabled,
		isUserAuthenticated,
		setIsUserAuthenticated,
		setIsBiometricsOverlayVisible,
	]);

	// Monitors AppState and adjust the authentication state accordingly.
	useEffect(() => {
		const subscription = AppState.addEventListener(
			'change',
			(nextAppState) => {
				switch (nextAppState) {
					case 'active':
						if (
							// Revoke user authentication if the timeout has run out.
							appState.current === 'background' &&
							goneToBackgroundAtTimestamp.current &&
							goneToBackgroundAtTimestamp.current <
								Date.now() - KEEP_LOGGED_IN_TIMEOUT
						) {
							setIsUserAuthenticated(false);
						} else if (isUserAuthenticated) {
							setIsBiometricsOverlayVisible(false);
						}

						break;

					case 'background':
						setIsBiometricsOverlayVisible(true);
						goneToBackgroundAtTimestamp.current = Date.now();
						break;

					case 'inactive':
						setIsBiometricsOverlayVisible(true);
						break;

					default:
						return;
				}

				appState.current = nextAppState;
				setAppStateVisible(appState.current);
			}
		);

		return () => subscription.remove();
	}, [
		isBiometricsOptionEnabled,
		setIsUserAuthenticated,
		setIsBiometricsOverlayVisible,
		isUserAuthenticated,
	]);

	// Ask the user for an authentication whenever the authentication state changes.
	useEffect(() => {
		const auth = async () => {
			await handleAuthentication();
		};

		// Ask for authentication only if the app is in active opened state.
		if (appStateVisible === 'active') {
			auth();
		}

		// Only run once on app start from killed state
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appStateVisible, isUserAuthenticated, isBiometricsOptionEnabled]);
};

export const useIsUserAuthenticated = () => {
	const [isUserAuthenticated, setIsUserAuthenticated] = useAtom(
		isUserAuthenticatedAtom
	);

	return { isUserAuthenticated, setIsUserAuthenticated };
};

export const useIsBiometricsEnabled = () => {
	const [isBiometricsOptionEnabled, setIsBiometricsOptionEnabled] =
		usePreference('faceIDEnabled', { saveOnProfile: false });
	const [authTypes, setAuthTypes] = useState<
		LocalAuthentication.AuthenticationType[]
	>([]);

	useEffect(() => {
		(async () => {
			setAuthTypes(
				await LocalAuthentication.supportedAuthenticationTypesAsync()
			);
		})();
	}, []);

	return {
		isBiometricsOptionEnabled,
		setIsBiometricsOptionEnabled,
		authTypes,
	};
};

export const useIsBiometricsOverlayVisible = () => {
	const { isBiometricsOptionEnabled } = useIsBiometricsEnabled();
	const [
		isBiometricsOverlayVisibleAtomValue,
		setBiometricsOverlayVisibleAtomValue,
	] = useAtom(isBiometricsOverlayVisibleAtom);

	// If biometrics option is disabled, always return false.
	const isBiometricsOverlayVisible =
		isBiometricsOptionEnabled && isBiometricsOverlayVisibleAtomValue;

	const setIsBiometricsOverlayVisible = (value: boolean) => {
		// Change value only if biometrics options is turned on to prevent showing overlay without enabled biometrics.
		setBiometricsOverlayVisibleAtomValue(
			isBiometricsOptionEnabled ? value : false
		);
	};

	return {
		isBiometricsOverlayVisible,
		setIsBiometricsOverlayVisible,
	};
};
