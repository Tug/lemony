import assert from 'assert';
import { CallbacksOptions } from 'next-auth';
import { encode } from 'next-auth/jwt';

assert(process.env.NEXTAUTH_SECRET, 'NEXTAUTH_SECRET env variable is missing');

export const defaultCallbacks: CallbacksOptions = {
	signIn() {
		return true;
	},

	redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
		if (url.startsWith('/')) return `${baseUrl}${url}`;
		else if (new URL(url).origin === baseUrl) return url;
		return baseUrl;
	},

	session({ session }) {
		return session;
	},

	jwt({ token }) {
		return token;
	},
};

const DEFAULT_MAX_AGE =
	60 * 60 * 24 * Number(process.env.JWT_EXPIRATION_DAYS ?? 7);

// JWT tokens created by next-auth/jwt are encrypted and thus
// cannot be used on the client (to check for expiration for instance)
// see https://github.com/nextauthjs/next-auth/issues/320
export async function generateToken(
	user: {
		id: string;
		email: string | null;
	},
	maxAge = DEFAULT_MAX_AGE
) {
	const callbacks: CallbacksOptions = {
		...defaultCallbacks,
		// TODO: get custom callbacks from [...nextauth]
	};
	const isAllowed = callbacks.signIn({
		user,
		account: null,
		profile: undefined,
	});
	if (!isAllowed) {
		throw new Error('Forbidden action');
	}
	const defaultToken = {
		email: user.email,
		sub: user.id?.toString(),
	};
	const tokenData = await callbacks.jwt({
		token: defaultToken,
		user,
		account: null,
		profile: undefined,
		isNewUser: false,
	});
	return await encode({
		token: tokenData,
		secret: process.env.NEXTAUTH_SECRET ?? '',
		maxAge,
	});
}
