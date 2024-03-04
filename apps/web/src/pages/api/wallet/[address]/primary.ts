import apiHandler from '../../../../helpers/api/api-handler';
import prisma from '../../../../lib/prismadb';
import { NextApiRequest, NextApiResponse } from 'next';

export default apiHandler(
	{
		patch: makePrimary,
	},
	{ requiresAuth: true }
);

async function makePrimary(req: NextApiRequest, res: NextApiResponse) {
	const userId = req.nextauth.token.sub;
	const { address } = req.query;
	if (!address || typeof address !== 'string') {
		throw new Error('Invalid wallet address');
	}
	await prisma.wallet.update({
		where: {
			address,
		},
		data: {
			isPrimary: true,
		},
	});
	await prisma.wallet.updateMany({
		where: {
			ownerId: userId,
			address: { not: address },
			isPrimary: true,
		},
		data: {
			isPrimary: false,
		},
	});
	return {};
}
