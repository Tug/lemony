import './types';
import { NextApiRequest, NextApiResponse } from 'next';
import {
	createMiddlewareDecorator,
	NextFunction,
	UnauthorizedException,
} from 'next-api-decorators';

const authorized = (req: NextApiRequest, apiKey: string): boolean => {
	// TODO NEXT: evaluate risk? check vercel envs
	if (process.env.NODE_ENV === 'development') {
		return true;
	}
	const { authorization } = req.headers;
	return authorization === `Bearer ${apiKey}`;
};

export function requireAPIKeyMiddleware(
	apiKey: string = process.env.API_SECRET_KEY
) {
	return async (
		req: NextApiRequest,
		res: NextApiResponse,
		next: NextFunction
	) => {
		if (!authorized(req, apiKey)) {
			throw new UnauthorizedException();
		}
		next();
	};
}

export default createMiddlewareDecorator(requireAPIKeyMiddleware());
