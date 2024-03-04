import { useFocusEffect } from '@diversifiedfinance/app/lib/react-navigation/native';
import { useCallback, useRef } from 'react';

type Callback = (...args: any[]) => void;

export function useStableFocusEffect(callback: Callback) {
	const callbackRef = useRef<Callback>();
	callbackRef.current = callback;

	useFocusEffect(
		useCallback(() => {
			const handleFocus = callbackRef.current;
			if (handleFocus) {
				handleFocus();
			}

			return () => {
				callbackRef.current = undefined;
			};
		}, [])
	);
}
