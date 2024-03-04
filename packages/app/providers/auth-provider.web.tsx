import { AuthProvider as AuthProviderBase } from './auth-provider.tsx';
import React from 'react';

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const handleDisconnect = () => {
		localStorage.removeItem('walletconnect');
	};

	return (
		<AuthProviderBase onWagmiDisconnect={handleDisconnect}>
			{children}
		</AuthProviderBase>
	);
}
