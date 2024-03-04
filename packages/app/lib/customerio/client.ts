import {
	CioLogLevel,
	CustomerIO,
	CustomerioConfig,
	CustomerIOEnv,
	Region,
} from 'customerio-reactnative';
import assert from 'assert';

assert(
	process.env.NEXT_PUBLIC_CUSTOMER_IO_SITE_ID,
	'NEXT_PUBLIC_CUSTOMER_IO_SITE_ID env variable is missing'
);
assert(
	process.env.NEXT_PUBLIC_CUSTOMER_IO_API_KEY,
	'NEXT_PUBLIC_CUSTOMER_IO_API_KEY env variable is missing'
);

export const init = () => {
	const env = new CustomerIOEnv();
	env.siteId = process.env.NEXT_PUBLIC_CUSTOMER_IO_SITE_ID;
	env.apiKey = process.env.NEXT_PUBLIC_CUSTOMER_IO_API_KEY;
	env.region = Region.EU;

	const data = new CustomerioConfig();
	data.logLevel = __DEV__ ? CioLogLevel.info : CioLogLevel.error;
	// we do it manually in use-handle-notification.ts
	data.autoTrackPushEvents = false;
	data.autoTrackDeviceAttributes = true;

	// https://customer.io/docs/sdk/react-native/in-app-messages/set-up-in-app/#set-up-in-app-messaging
	data.enableInApp = true;

	CustomerIO.initialize(env, data);
};

export default CustomerIO;
