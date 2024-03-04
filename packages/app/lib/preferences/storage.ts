import { MMKV } from 'react-native-mmkv';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

export function atomWithUnecryptedStorage(
	mmkvStorage: MMKV,
	unstable_options?: {
		unstable_getOnInit?: boolean;
	}
) {
	return <T>(key: string, initialValue: T) =>
		atomWithStorage<T>(
			key,
			initialValue,
			createJSONStorage(() => ({
				getItem<T>(key: string): T | null {
					const value = mmkvStorage.getString(key);
					return value ? JSON.parse(value) : null;
				},
				setItem<T>(key: string, value: T): void {
					mmkvStorage.set(key, JSON.stringify(value));
				},
				removeItem(key: string): void {
					mmkvStorage.delete(key);
				},
				clearAll(): void {
					mmkvStorage.clearAll();
				},
			})),
			unstable_options
		);
}
