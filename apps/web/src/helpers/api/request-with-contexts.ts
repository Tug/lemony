import type { NextApiRequest } from 'next';

export type NextApiRequestWithContext<T> = NextApiRequest & {
	context: T;
};
