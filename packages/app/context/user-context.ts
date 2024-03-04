import type { MyInfo } from '@diversifiedfinance/types/diversified';
import { createContext } from 'react';
import type { KeyedMutator } from 'swr';

type UserContextType = {
	user?: MyInfo;
	error?: Error;
	isLoading: boolean;
	isAuthenticated: boolean;
	isIncompletedProfile: boolean | undefined;
	isTermsNotAccepted: boolean | undefined;
	isVerifiedProfile: boolean | undefined;
	isFailedKYC: boolean | undefined;
	mutate: KeyedMutator<MyInfo>;
};

export const UserContext = createContext<UserContextType | null>(null);
