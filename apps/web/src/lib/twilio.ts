import assert from 'assert';
import twilio from 'twilio';

assert(
	process.env.TWILIO_ACCOUNT_SID,
	'TWILIO_AUTH_TOKEN env variable is missing'
);
assert(
	process.env.TWILIO_VERIFY_SID,
	'TWILIO_VERIFY_SID env variable is missing'
);
assert(
	process.env.TWILIO_AUTH_TOKEN,
	'TWILIO_AUTH_TOKEN env variable is missing'
);

const client = twilio(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

export default client;

export const twilioVerifyClient = client.verify.v2.services(
	process.env.TWILIO_VERIFY_SID
);
