import './types';
import { NextApiRequest, NextApiResponse } from 'next';
import {
	createMiddlewareDecorator,
	NextFunction,
	UnauthorizedException,
} from 'next-api-decorators';
import { getToken, JWT } from 'next-auth/jwt';
import { decodeNoLimit } from '../../lib/decode-token-no-limit';
import { getUserFromDB } from '../../lib/auth';
import { Role } from '@prisma/client';

const authorized = (
	token: JWT | null
): token is JWT & { sub: NonNullable<JWT['sub']> } =>
	Boolean(token && token.sub);

const authTokenMiddleware = async (
	req: NextApiRequest,
	res: NextApiResponse,
	next: NextFunction
) => {
	const token = await getToken({
		req,
		decode: decodeNoLimit,
	});

	if (!authorized(token)) {
		throw new UnauthorizedException();
	}

	req.nextauth = { token };

	if (!req.nextauth.token.sub) {
		throw new UnauthorizedException('User not found');
	}

	next();
};

export default createMiddlewareDecorator(authTokenMiddleware);

export const RequiresAdminAuth = createMiddlewareDecorator(
	async (req: NextApiRequest, res: NextApiResponse, next: NextFunction) => {
		const user = await getUserFromDB(req);
		if (user.role !== Role.ADMIN) {
			throw new UnauthorizedException();
		}
	}
);
