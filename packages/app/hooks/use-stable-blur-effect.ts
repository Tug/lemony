import { useFocusEffect } from '@diversifiedfinance/app/lib/react-navigation/native';
import { useCallback, useRef } from 'react';

type Callback = (...args: any[]) => void;

export function useStableBlurEffect(callback: Callback) {
	const callbackRef = useRef<Callback>();
	callbackRef.current = callback;

	useFocusEffect(
		useCallback(() => {
			return () => {
				const handleBlur = callbackRef.current;
				if (handleBlur) {
					handleBlur();
				}

				callbackRef.current = undefined;
			};
		}, [])
	);
}
