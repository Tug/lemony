import apiHandler from '../../../../helpers/api/api-handler';
import prisma from '../../../../lib/prismadb';
import { NextApiRequest, NextApiResponse } from 'next';

export default apiHandler(
	{
		delete: removeWallet,
	},
	{ requiresAuth: true }
);

async function removeWallet(req: NextApiRequest, res: NextApiResponse) {
	const userId = req.nextauth.token.sub;
	const { address } = req.query;
	if (!address || typeof address !== 'string') {
		throw new Error('Invalid wallet address');
	}
	await prisma.wallet.deleteMany({
		where: {
			address,
			ownerId: userId,
			owner: {
				wallets: {
					some: {
						address: { not: address },
					},
				},
			},
		},
	});
	return {};
}
