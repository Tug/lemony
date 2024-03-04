import './types';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMiddlewareDecorator, NextFunction } from 'next-api-decorators';
import type { NextApiRequestWithContext } from './request-with-contexts';

const withAPIVersionMiddleware = async (
	req: NextApiRequest,
	res: NextApiResponse,
	next: NextFunction
) => {
	if (!req.context) {
		req.context = {};
	}

	req.context.apiVersion = req.body.apiVersion;

	next();
};

export default createMiddlewareDecorator(withAPIVersionMiddleware);

export type APIVersionMiddlewareContext = { apiVersion?: string };

export type NextApiRequestWithAPIVersionContext =
	NextApiRequestWithContext<APIVersionMiddlewareContext>;
