import { SchemaTypes } from './prismadb';
import crypto from 'crypto';

export function getIntercomUserHash(user: SchemaTypes.User) {
	if (!process.env.INTERCOM_ID_VERIFICATION) {
		return null;
	}
	return crypto
		.createHmac('sha256', process.env.INTERCOM_ID_VERIFICATION)
		.update(user.id)
		.digest('hex');
}
