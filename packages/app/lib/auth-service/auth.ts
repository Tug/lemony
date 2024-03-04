import { useContext } from 'react';
import { AuthServiceContext } from './auth-service-provider';

function useAuthService() {
	const context = useContext(AuthServiceContext);
	if (!context) {
		throw new Error(
			'useAuthService must be used within an AuthServiceProvider'
		);
	}
	return context;
}

export { useAuthService };
