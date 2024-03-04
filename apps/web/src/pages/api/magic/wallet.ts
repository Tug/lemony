import apiHandler from '../../../helpers/api/api-handler';
import prisma from '../../../lib/prismadb';
import { NextApiRequest, NextApiResponse } from 'next';

export default apiHandler(
	{
		post: wallet,
	},
	{ requiresAuth: true }
);

async function wallet(req: NextApiRequest, res: NextApiResponse) {
	const userId = req.nextauth.token.sub;
	const { email, phoneNumber } = req.body;
	if (email || phoneNumber) {
		await prisma.user.update({
			where: { id: userId },
			data: {
				...(email && { email }),
				...(phoneNumber && { phoneNumber }),
			},
		});
	}
	return {};
}
