import { NextApiRequest, NextApiResponse } from 'next';
import { captureException } from '@sentry/nextjs';
import {
	BadRequestException,
	HttpException,
	UnauthorizedException,
} from 'next-api-decorators';
import {
	CheckoutErrorType,
	LoginErrorType,
} from '@diversifiedfinance/types/diversified';
import { SchemaTypes } from './prismadb';
import { CannabisException } from './http-errors';

export class CheckoutError extends Error {
	constructor(
		public message: string,
		public type: CheckoutErrorType,
		public context?: {
			orderId?: string;
			crowdfundingState?: SchemaTypes.ProjectCrowdfundingState;
			psp?: {
				txId: string;
				message: string;
				code: string;
			};
			limits?: {
				MIN_AMOUNT_EUR: number;
				MAX_AMOUNT_EUR: number;
			};
		}
	) {
		super(message);
	}
}

export class LoginError extends UnauthorizedException {
	constructor(public message: string, public type: LoginErrorType) {
		super(message);
	}
}

export function exceptionHandler(
	error: unknown,
	req: NextApiRequest,
	res: NextApiResponse
) {
	const publicMessage =
		error?.message ??
		'An unknown error occurred. Our team has been alerted.';

	console.error(
		error?.message ?? error?.Message ?? error?.toString(),
		error?.stack ?? error,
		error?.context,
		error?.requestOptions
			? {
					requestOptions: error?.requestOptions,
					responseUrl: error?.response?.responseUrl,
					data: error?.data,
			  }
			: null
	);

	if (
		__DEV__ &&
		error?.message ===
			'an unknown value was passed to the validate function'
	) {
		console.log(req.body);
	}

	const statusCode = error instanceof HttpException ? error.statusCode : 500;
	// ignore auth failure errors
	if (statusCode !== 401) {
		captureException(error);
	}

	res.status(statusCode).json({
		success: false,
		error: publicMessage,
		...(error instanceof CheckoutError && {
			name: 'CheckoutError',
			type: error.type,
		}),
		...(error instanceof LoginError && {
			name: 'LoginError',
			type: error.type,
		}),
		...(error instanceof CannabisException && {
			verificationToken: error.verificationToken,
		}),
		...(error instanceof BadRequestException && {
			name: 'BadRequestException',
			errors: error.errors,
		}),
		...(error?.context && { context: error.context }), // context should only contain public data
	});
}
