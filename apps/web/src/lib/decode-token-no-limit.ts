import { jwtDecrypt } from 'jose';
import hkdf from '@panva/hkdf';

async function getDerivedEncryptionKey(secret: string) {
	return await hkdf(
		'sha256',
		secret,
		'',
		'NextAuth.js Generated Encryption Key',
		32
	);
}

export async function decodeNoLimit(params) {
	const { token, secret } = params;
	if (!token) return null;
	const encryptionSecret = await getDerivedEncryptionKey(secret);
	const { payload } = await jwtDecrypt(token, encryptionSecret, {
		clockTolerance: 365 * 3600,
	});
	return payload;
}
