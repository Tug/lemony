import React, { ReactNode } from 'react';
import { LockScreen } from '@diversifiedfinance/app/navigation/components/lock-screen';
import {
	useBiometrics,
	useIsBiometricsOverlayVisible,
} from '@diversifiedfinance/app/hooks/use-biometrics';

type AuthenticatorProviderProps = {
	children: ReactNode;
};

export const LocalAuthProvider = ({ children }: AuthenticatorProviderProps) => {
	useBiometrics();
	const { isBiometricsOverlayVisible } = useIsBiometricsOverlayVisible();
	return (
		<>
			{children}
			{isBiometricsOverlayVisible && <LockScreen />}
		</>
	);
};
