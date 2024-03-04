import './types';
import { NextApiRequest, NextApiResponse } from 'next';
import { decode, getToken, JWT } from 'next-auth/jwt';
import { UnauthorizedException } from 'next-api-decorators';

const authorized = (
	token: JWT | null
): token is JWT & { sub: NonNullable<JWT['sub']> } =>
	Boolean(token && token.sub);

export type NextApiRequestWithAuth = NextApiRequest & {
	nextauth: { token: JWT & { sub: NonNullable<JWT['sub']> } };
};

export default async function authHandler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// // in case "edge middleware" is run locally, should not happen anymore with Next 13...
	// // TODO NEXT: cleanup
	// if (req.nextauth && req.nextauth.token.sub) {
	// 	return;
	// }

	const token = await getToken({
		req,
		decode,
	});

	if (authorized(token)) {
		req.nextauth = { token };
	}

	if (!req.nextauth) {
		throw new Error(`Auth middleware not set up for route ${req.url}.`);
	}

	if (!req.nextauth.token.sub) {
		throw new UnauthorizedException('User not found');
	}
}
