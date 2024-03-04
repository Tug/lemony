import { usePreference } from '@diversifiedfinance/app/hooks/use-preference';

export const useBiometrics = () => {};

export enum AuthenticationType {
	/**
	 * Indicates fingerprint support.
	 */
	FINGERPRINT = 1,
	/**
	 * Indicates facial recognition support.
	 */
	FACIAL_RECOGNITION = 2,
	/**
	 * Indicates iris recognition support.
	 * @platform android
	 */
	IRIS = 3,
}

export const useIsUserAuthenticated = () => {
	return { isUserAuthenticated: true, setIsUserAuthenticated: () => {} };
};

export const useIsBiometricsEnabled = () => {
	const [isBiometricsOptionEnabled, setIsBiometricsOptionEnabled] =
		usePreference('faceIDEnabled', { saveOnProfile: false });

	return {
		isBiometricsOptionEnabled,
		setIsBiometricsOptionEnabled,
		authTypes: [],
	};
};

export const useIsBiometricsOverlayVisible = () => {
	return {
		isBiometricsOverlayVisible: false,
		setIsBiometricsOverlayVisible: () => {},
	};
};
