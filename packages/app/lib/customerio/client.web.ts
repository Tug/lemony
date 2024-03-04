import assert from 'assert';
import axios from 'axios';
import { isServer } from '@diversifiedfinance/app/lib/is-server';

assert(
	process.env.NEXT_PUBLIC_CUSTOMER_IO_SITE_ID,
	'NEXT_PUBLIC_CUSTOMER_IO_SITE_ID env variable is missing'
);
assert(
	process.env.NEXT_PUBLIC_CUSTOMER_IO_API_KEY,
	'NEXT_PUBLIC_CUSTOMER_IO_API_KEY env variable is missing'
);

export const init = async () => {};

let user = {
	id: '',
	deviceAttributes: {},
	profileAttributes: {},
};

export const client = axios.create({
	baseURL: 'https://track-eu.customer.io/api/v2',
	timeout: isServer ? 30000 : 5000,
	headers: {
		'Content-Type': 'application/json',
	},
	auth: {
		username: process.env.NEXT_PUBLIC_CUSTOMER_IO_SITE_ID,
		password: process.env.NEXT_PUBLIC_CUSTOMER_IO_API_KEY,
	},
});

export const trackV2 = (data: any) => {
	if (Array.isArray(data)) {
		return client.post('/batch', {
			batch: data,
		});
	}
	return client.post('/entity', data);
};

export const identify = async (userId: string, attributes: any) => {
	user = {
		id: userId,
		deviceAttributes: user.id === userId ? {} : user.deviceAttributes,
		profileAttributes: user.id === userId ? attributes : {},
	};
	if (!userId) {
		return;
	}
	return trackV2({
		type: 'person',
		identifiers: { id: userId },
		action: 'identify',
		attributes,
	});
};

export const clearIdentify = () => {
	user = {
		id: '',
		deviceAttributes: {},
		profileAttributes: {},
	};
};

export const track = async (name: string, attributes?: Object) => {
	if (!user.id) {
		// We don't track anonymous users on customer.io
		return;
	}

	return trackV2({
		type: 'person',
		identifiers: { id: user.id },
		action: 'event',
		name,
		timestamp: Math.round(Date.now() / 1000),
		attributes,
	});
};

const screen = async (name: string, attributes?: Object) => {
	if (!user.id) {
		// We don't track anonymous users on customer.io
		return;
	}

	await trackV2({
		type: 'person',
		identifiers: { id: user.id },
		action: 'screen',
		name,
		timestamp: Math.round(Date.now() / 1000),
		attributes,
	});

	if (attributes?.path) {
		await trackV2({
			type: 'person',
			identifiers: { id: user.id },
			action: 'page',
			name: attributes.path,
			timestamp: Math.round(Date.now() / 1000),
			attributes,
		});
	}
};

const setDeviceAttributes = (data: Object) => {
	user.deviceAttributes = {
		...user.deviceAttributes,
		...data,
	};
	// We don't register browser as a device right now
	// trackV2({
	// 	type: 'person',
	// 	identifiers: { id: user.id },
	// 	action: 'add_device',
	// 	device: data,
	// });
};

const setProfileAttributes = (data: Object) => {
	user.profileAttributes = {
		...user.profileAttributes,
		...data,
	};
	identify(user.id, user.profileAttributes);
};

const pushMessaging = () => {
	return {
		onMessageReceived: (message: any) => Promise.resolve(false),
	};
};

const CustomerIO = {
	identify,
	clearIdentify,
	track,
	screen,
	setDeviceAttributes,
	setProfileAttributes,
	pushMessaging,
};

export default CustomerIO;
