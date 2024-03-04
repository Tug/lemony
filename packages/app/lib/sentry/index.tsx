import { Platform } from 'react-native';
import * as Sentry from 'sentry-expo';
import { CaptureContext } from '@sentry/types';

export const config = {
	dsn: process.env.SENTRY_DSN,
	environment: process.env.STAGE,
	enableInExpoDevelopment: false, // true,
	debug: false, // __DEV__,
	beforeSend(event, hint) {
		// Warning: sentry can cause a crash if error is an error-like object
		// see: https://diversified.sentry.io/issues/3934046206/

		// Handle AxiosError
		if (
			hint &&
			hint.originalException &&
			hint.originalException.isAxiosError
		) {
			if (
				hint.originalException.response &&
				hint.originalException.response.data
			) {
				event.contexts = {
					...event.contexts,
					errorResponse: {
						data: hint.originalException.response.data,
					},
				};
			}
		}

		return event;
	},
};

export const init = () => Sentry.init(config);

export const captureException = (error: any, context?: CaptureContext) => {
	if (Platform.OS === 'web') {
		Sentry.Browser.captureException(error, context);
	} else {
		Sentry.Native.captureException(error, context);
	}
};

export const captureMessage = (message: any, context?: CaptureContext) => {
	if (Platform.OS === 'web') {
		Sentry.Browser.captureMessage(message, context);
	} else {
		Sentry.Native.captureMessage(message, context);
	}
};

export { Sentry };
