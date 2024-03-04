import { useEffect, useState } from 'react';

export const useIsOnline = () => {
	const notABrowserEnv = typeof window === 'undefined';
	const navigatorNotPresent = typeof navigator === 'undefined';
	if (notABrowserEnv || navigatorNotPresent) {
		throw new Error('useIsOnline only works in a browser environment.');
	}

	const [isOnline, setOnlineStatus] = useState(window.navigator.onLine);

	useEffect(() => {
		const toggleOnlineStatus = () =>
			setOnlineStatus(window.navigator.onLine);

		window.addEventListener('online', toggleOnlineStatus);
		window.addEventListener('offline', toggleOnlineStatus);

		return () => {
			window.removeEventListener('online', toggleOnlineStatus);
			window.removeEventListener('offline', toggleOnlineStatus);
		};
	}, [isOnline]);

	return {
		isOnline,
	};
};
