import prisma from '../prismadb';
import { upsertUserFromWallet } from '../user';
import assert from 'assert';
import type { IncomingMessage } from 'http';
import type { RequestInternal } from 'next-auth/core';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getCsrfToken } from 'next-auth/react';
import { SiweMessage } from 'siwe';

// Inspired from https://docs.login.xyz/integrations/nextauth.js
// And https://blog.spruceid.com/sign-in-with-ethereum-on-next-js-applications/
export async function authorize(
	credentials?: {
		message?: string;
		signature?: string;
	},
	req?: Pick<RequestInternal, 'body' | 'query' | 'headers' | 'method'>
): Promise<{ id: string; email: string | null }> {
	if (!credentials) {
		throw new Error('Malformed request');
	}
	const siwe = new SiweMessage(
		typeof credentials.message === 'string'
			? JSON.parse(credentials?.message || '{}')
			: credentials.message
	);
	const nextAuthUrl = new URL(process.env.NEXTAUTH_URL ?? '');

	const result = await siwe.verify({
		signature: credentials?.signature || '',
		domain: nextAuthUrl.host,
		nonce: await getCsrfToken({ req: req as IncomingMessage }),
	});

	if (!result.success) {
		throw new Error('Failed validating signature');
	}

	const { user } = await upsertUserFromWallet({ address: siwe.address });

	return {
		id: user.id,
		email: user.email,
	};
}

export default () => {
	assert(process.env.NEXTAUTH_URL, 'NEXTAUTH_URL env variable is missing');

	return CredentialsProvider({
		id: 'ethereum',
		name: 'Ethereum Wallet',
		credentials: {
			message: { label: 'Message', type: 'text', placeholder: '0x0' },
			signature: { label: 'Signature', type: 'text', placeholder: '0x0' },
		},
		authorize,
	});
};
