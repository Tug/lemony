import { useNetInfo } from '@react-native-community/netinfo';

export const useIsOnline = () => {
	const netInfo = useNetInfo();

	return {
		isOnline: netInfo.type === 'unknown' ? undefined : netInfo.isConnected,
	};
};
