import { JWT } from 'next-auth/jwt';

declare module 'next' {
	interface NextApiRequest {
		nextauth: { token: JWT & { sub: NonNullable<JWT['sub']> } };
	}
}
