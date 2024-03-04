import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import {
	Catch,
	createHandler,
	Get,
	Query,
	SetHeader,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import prisma from '../../../lib/prismadb';
import {
	getSystemUser,
	mangopayMoneyToDecimal,
} from '../../../lib/payment/utils';
import { Mango } from '../../../lib/payment/client';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class CheckUserCreditsHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async checkAllCredits(
		@Query('use_sandbox') use_sandbox: string
	): Promise<{
		ok: boolean;
		totalDb: number;
		totalMango: number;
	}> {
		const useSandbox = Boolean(use_sandbox);
		// exclude propco user
		const totalCreditsDbRes = await prisma.$queryRaw`
			SELECT SUM(u."creditsEur") AS total_credits FROM public.users u WHERE u.role = 'USER'
		`;
		const totalCreditsDb = totalCreditsDbRes?.[0]?.total_credits;
		const { mangopayCreditsWalletId } = await getSystemUser('OWNER', {
			useSandbox,
		});
		if (!mangopayCreditsWalletId) {
			throw new Error(
				'System user OWNER misconfigured. Missing credits wallet.'
			);
		}
		const mangoClient = Mango.getDefaultClient({ useSandbox });
		const creditsWallet = await mangoClient.Wallets.get(
			mangopayCreditsWalletId
		);
		const walletBalance = mangopayMoneyToDecimal(
			creditsWallet.Balance.Amount
		);
		const areEqual = walletBalance.equals(totalCreditsDb);

		return {
			ok: areEqual,
			totalDb: totalCreditsDb.toNumber(),
			totalMango: walletBalance.toNumber(),
		};
	}
}

export default createHandler(CheckUserCreditsHandler);
