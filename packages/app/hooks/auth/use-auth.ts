import { AuthContext } from '@diversifiedfinance/app/context/auth-context';
import { useContext } from 'react';

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error(
			'You need to add `AuthProvider` to your root component'
		);
	}

	return context;
}
