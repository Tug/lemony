import apiHandler from '../../../../helpers/api/api-handler';
import prisma from '../../../../lib/prismadb';
import { NextApiRequest, NextApiResponse } from 'next';
import { magic } from '../../../../lib/magic-admin';
import { updateUserData } from '../../../../lib/user';
import { getUserFromDB } from '../../../../lib/auth';

export default apiHandler(
	{
		post: addWallet,
	},
	{ requiresAuth: true }
);

async function addWallet(req: NextApiRequest, res: NextApiResponse) {
	const user = await getUserFromDB(req);
	const { address: addressFromQuery } = req.query;
	const { email, didToken } = req.body;
	await magic.token.validate(didToken);
	const metadata = await magic.users.getMetadataByToken(didToken);
	if (addressFromQuery !== metadata.publicAddress) {
		throw new Error('Wallet address do not match');
	}
	const walletMetadata = {
		...metadata,
		is_email: Boolean(metadata.email && !metadata.oauthProvider),
		is_phone: Boolean(metadata.phoneNumber && !metadata.oauthProvider),
		is_apple: metadata.oauthProvider === 'apple',
		is_google: metadata.oauthProvider === 'google',
	};
	if (metadata.publicAddress) {
		await prisma.wallet.create({
			data: {
				ownerId: user.id,
				address: metadata.publicAddress,
				metadata: walletMetadata,
			},
		});
		await updateUserData(user, metadata);
	}
	return {};
}
