// WARNING: untested code
import type { NextApiRequest } from 'next';
import {
	Body,
	Catch,
	createHandler,
	Post,
	Req,
	ValidationPipe,
} from 'next-api-decorators';
import RequiresAuth from '../../../helpers/api/requires-auth';
import { exceptionHandler } from '../../../lib/error';
import { getUser } from '../../../lib/auth';
import { AddMagicWalletDTO } from '../../../dto/wallet';
import prisma, { SchemaTypes } from '../../../lib/prismadb';
import { magic } from '../../../lib/magic-admin';
import { CannabisException } from '../../../lib/http-errors';
import { getEurWallet } from '../../../lib/payment';

export async function canReassignUserWallet(
	publicAddress: string,
	toUserId: string
): Promise<{ canReassign: boolean; existingUser: SchemaTypes.User | null }> {
	const existingUser = await prisma.user.findFirst({
		where: {
			NOT: { id: toUserId },
			wallets: {
				some: {
					address: publicAddress,
				},
			},
			creditsEur: 0,
			orders: {
				none: {
					status: {
						in: ['paid', 'prepaid', 'processed', 'preprocessed'],
					},
				},
			},
		},
	});
	if (existingUser) {
		const eurWallet = await getEurWallet(existingUser);
		return {
			canReassign: !eurWallet || eurWallet.Balance.Amount === 0,
			existingUser,
		};
	}

	return {
		canReassign: false,
		existingUser: null,
	};
}

@RequiresAuth()
@Catch(exceptionHandler)
class AddMagicWalletHandler {
	// POST /api/wallet/add-magic-wallet
	@Post()
	public async add(
		@Req() req: NextApiRequest,
		@Body(ValidationPipe) body: AddMagicWalletDTO
	): Promise<{ ok: 1 }> {
		const userId = req.nextauth.token.sub;
		const user = await getUser(userId);
		const replace = Boolean(body.replace);
		const reassign = Boolean(body.reassign || body.reassign_wallet);
		await magic.token.validate(body.didToken);
		const metadata = await magic.users.getMetadataByToken(body.didToken);
		if (!metadata.publicAddress) {
			throw new Error('Wallet does not have a public address');
		}
		const walletMetadata = {
			...metadata,
			is_email: Boolean(metadata.email && !metadata.oauthProvider),
			is_phone: Boolean(metadata.phoneNumber && !metadata.oauthProvider),
			is_apple: metadata.oauthProvider === 'apple',
			is_google: metadata.oauthProvider === 'google',
		};
		if (reassign) {
			const { canReassign, existingUser } = await canReassignUserWallet(
				metadata.publicAddress,
				userId
			);
			if (!canReassign || !existingUser) {
				throw new Exception(
					'Account cannot be reassigned as it has assets.'
				);
			}
			await prisma.wallet.upsert({
				where: {
					address: metadata.publicAddress,
				},
				create: {
					ownerId: userId,
					address: metadata.publicAddress,
					metadata: walletMetadata,
				},
				update: {
					ownerId: userId,
					metadata: walletMetadata,
				},
			});
			await prisma.user.update({
				where: {
					id: existingUser.id,
				},
				data: {
					...(walletMetadata.is_email && {
						email: null,
						emailVerified: null,
					}),
					...(walletMetadata.is_phone && {
						phoneNumber: null,
						phoneNumberVerified: null,
					}),
					...(((walletMetadata.is_email &&
						!existingUser.phoneNumberVerified) ||
						(walletMetadata.is_phone &&
							!existingUser.emailVerified)) && {
						disabled: true,
					}),
				},
			});
		} else {
			const existingWallet = await prisma.wallet.findUnique({
				where: {
					address: metadata.publicAddress,
				},
			});
			if (existingWallet) {
				if (existingWallet.ownerId !== userId) {
					throw new CannabisException(
						'Wallet already exists and is linked to another user'
					);
				}
			} else {
				await prisma.wallet.create({
					data: {
						ownerId: userId,
						address: metadata.publicAddress,
						metadata: walletMetadata,
					},
				});
			}
		}
		if (replace) {
			const wallets = await prisma.wallet.findMany({
				where: {
					ownerId: userId,
					address: { not: metadata.publicAddress },
				},
			});
			const is_what = Object.entries(walletMetadata).find(
				([key, value]) => key.startsWith('is_') && value
			)?.[0];
			for (const wallet of wallets) {
				if (wallet.metadata?.[is_what]) {
					await prisma.wallet.delete({
						where: {
							id: wallet.id,
						},
					});
				}
			}
		}
		const userDataToUpdate = {
			...(metadata.phoneNumber &&
				(!user.phoneNumber || replace || reassign) && {
					phoneNumber: metadata.phoneNumber,
					phoneNumberVerified: new Date(),
				}),
			...(metadata.email &&
				(!user.email || replace || reassign) && {
					email: metadata.email,
					emailVerified: new Date(),
				}),
		};
		if (Object.keys(userDataToUpdate).length > 0) {
			await prisma.user.update({
				where: { id: userId },
				data: userDataToUpdate,
			});
		}
		return { ok: 1 };
	}
}

export default createHandler(AddMagicWalletHandler);
