import { NextApiRequestWithAuth } from '../../middleware';
import authHandler from './auth-handler';
import { exceptionHandler } from '../../lib/error';
import type { NextApiResponse } from 'next';

interface ApiHandlerOptions {
	requiresAuth?: boolean;
}

enum AllowedMethods {
	get = 'get',
	post = 'post',
	patch = 'patch',
	delete = 'delete',
}
type Handler = (req: NextApiRequestWithAuth, res: NextApiResponse) => any;
type ApiHandlerHandler = Partial<Record<AllowedMethods, Handler>>;

export default function apiHandler(
	handler: ApiHandlerHandler,
	options: ApiHandlerOptions = {}
) {
	return async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
		const method: AllowedMethods =
			AllowedMethods[
				req.method?.toLowerCase() as keyof typeof AllowedMethods
			];

		const handlerFunction = handler[method];

		// check handler supports HTTP method
		if (!handlerFunction) {
			return res.status(405).end(`Method ${req.method} Not Allowed`);
		}

		try {
			if (options.requiresAuth) {
				await authHandler(req, res);
			}

			// route handler
			const response = await handlerFunction(req, res);
			if (response) {
				res.status(200).json(response);
			}
		} catch (err) {
			// global error handler
			exceptionHandler(err, req, res);
		}
	};
}
