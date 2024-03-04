import { magic } from '../magic-admin';
import { upsertUserFromWallet } from '../user';
import assert from 'assert';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MagicAuthCredentialsDTO } from '../../dto/auth';

export async function authorize(
	credentials?: MagicAuthCredentialsDTO
): Promise<{ id: string; email: string | null }> {
	if (!credentials) {
		throw new Error('Malformed request');
	}
	const { didToken } = credentials;
	if (!didToken) {
		throw new Error('DID Token missing');
	}
	await magic.token.validate(didToken);
	// This actually fetches the data from magic server
	const metadata = await magic.users.getMetadataByToken(didToken);

	if (!metadata.publicAddress) {
		throw new Error(
			'No public address associated with this DID Token, this is weird.'
		);
	}

	if (!metadata.issuer) {
		throw new Error(
			'No issuer associated with this DID Token, this is weird.'
		);
	}

	const { user } = await upsertUserFromWallet(
		{ address: metadata.publicAddress },
		{
			email: metadata.email ?? undefined,
			phoneNumber: metadata.phoneNumber ?? undefined,
		},
		// might be useful one day
		{
			provider: 'magic',
			providerAccountId: metadata.issuer,
			providerMetadata: metadata,
		},
		{
			credentials,
		}
	);

	return {
		id: user.id,
		email: user.email,
	};
}

export default () => {
	assert(process.env.MAGIC_API_KEY, 'MAGIC_API_KEY env variable is missing');

	return CredentialsProvider({
		id: 'magic',
		name: 'Magic.Link',
		credentials: {
			didToken: { label: 'DID Token', type: 'text' },
			phoneNumber: { label: 'Phone Number', type: 'text' },
			email: { label: 'Email', type: 'text' },
			activationCode: { label: 'Activation Code', type: 'text' },
		},
		authorize,
	});
};
