import prisma, { UserWithWallets, userWithWalletsIncludes } from './prismadb';
import { NextApiRequest } from 'next';
import { UnauthorizedException } from 'next-api-decorators';

export async function getUser(
	userId: string,
	includes?: any
): Promise<UserWithWallets> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: includes ?? userWithWalletsIncludes,
	});
	if (!user) {
		throw new UnauthorizedException('User not found in DB');
	}
	return user;
}

export async function getUserFromDB(
	req: NextApiRequest
): Promise<UserWithWallets> {
	return getUser(req.nextauth?.token.sub);
}
