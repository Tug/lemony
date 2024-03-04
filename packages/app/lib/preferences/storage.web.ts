import { atomWithStorage } from 'jotai/utils';

export function atomWithUnecryptedStorage(storage = undefined) {
	return <T>(key: string, initialValue: T) =>
		atomWithStorage<T>(key, initialValue, storage);
}
