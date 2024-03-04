import type { NextApiRequest } from 'next';
import { Catch, createHandler, Get, Req } from 'next-api-decorators';
import RequiresAuth from '../../../helpers/api/requires-auth';
import { exceptionHandler } from '../../../lib/error';
import { getMangoWalletsPublicInfo } from '../../../lib/payment';
import { getUser } from '../../../lib/auth';
import type { WalletResponse } from '@diversifiedfinance/types';

@RequiresAuth()
@Catch(exceptionHandler)
class WalletHandler {
	// GET /api/wallet
	@Get()
	public async listWallets(
		@Req() req: NextApiRequest
	): Promise<WalletResponse> {
		const userId = req.nextauth.token.sub;
		const user = await getUser(userId);
		const fiatWallets = await getMangoWalletsPublicInfo(user);
		return {
			fiat: fiatWallets,
			credits: [
				{
					id: 'free',
					balance: user.creditsEur.toNumber(),
					currency: 'EUR',
				},
			],
			web3: user.wallets,
		};
	}
}

export default createHandler(WalletHandler);
