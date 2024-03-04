import assert from 'assert';
import GoogleProvider from 'next-auth/providers/google';

export default () => {
	assert(
		process.env.GOOGLE_CLIENT_ID,
		'GOOGLE_CLIENT_ID env variable is missing'
	);
	assert(
		process.env.GOOGLE_CLIENT_SECRET,
		'GOOGLE_CLIENT_SECRET env variable is missing'
	);
	return GoogleProvider({
		clientId: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	});
};
