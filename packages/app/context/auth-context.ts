import type { AuthenticationStatus } from '@diversifiedfinance/types';
import { createContext } from 'react';

type AuthContextType = {
	authenticationStatus: AuthenticationStatus;
	accessToken?: string;

	setAuthenticationStatus: (status: AuthenticationStatus) => void;

	login: (endpoint: string, payload: object) => Promise<void>;
	logout: (redirect?: boolean) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);
