import {
	Body,
	Catch,
	createHandler,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Req,
	UnauthorizedException,
	ValidationPipe,
} from 'next-api-decorators';
import prisma from '../../../../../lib/prismadb';
import RequiresAuth from '../../../../../helpers/api/requires-auth';
import { exceptionHandler } from '../../../../../lib/error';
import Mangopay from 'mangopay2-nodejs-sdk';
import type { bankAccount } from 'mangopay2-nodejs-sdk';
import { getUserFromDB } from '../../../../../lib/auth';
import { getPaymentContextForUser } from '../../../../../lib/payment/client';
import type { NextApiRequest } from 'next';
import {
	AddBankAccountDTO,
	BankAccountPayoutDTO,
	EditBankAccountDTO,
} from '../../../../../dto/mangopay';
import {
	dbAddressToMangopayAddress,
	getSystemUser,
} from '../../../../../lib/payment/utils';
import { BankAccountsResponse } from '@diversifiedfinance/types';
import {
	createBankAccount,
	getUserBankAccount,
	payout,
} from '../../../../../lib/payment/bank-account';

@RequiresAuth()
@Catch(exceptionHandler)
class BankAccountsHandler {
	// GET /api/payment/mangopay/bank-accounts
	@Get()
	public async list(
		@Req() req: NextApiRequest
	): Promise<BankAccountsResponse> {
		const user = await getUserFromDB(req);
		const { mangoClient, mangopayUserId, useSandbox } =
			getPaymentContextForUser(user);
		if (!mangopayUserId) {
			return [];
		}
		const systemUserOwner = await getSystemUser('OWNER', { useSandbox });
		const userBankAccounts = await prisma.userBankAccount.findMany({
			where: { userId: user.id, disabled: false },
		});
		return await Promise.all(
			userBankAccounts.map(
				async ({ id, label, mangopayBankAccountId }) => ({
					id,
					label: label ?? undefined,
					ibanData: (await mangoClient.Users.getBankAccount(
						systemUserOwner.mangopayId,
						mangopayBankAccountId
					)) as bankAccount.IBANData,
				})
			)
		);
	}

	// POST /api/payment/mangopay/bank-accounts
	@Post()
	public async create(
		@Body(ValidationPipe) body: AddBankAccountDTO,
		@Req() req: NextApiRequest
	): Promise<{ ok: 1 }> {
		const user = await getUserFromDB(req);
		await createBankAccount(user, body);
		return { ok: 1 };
	}

	// PATCH /api/payment/mangopay/bank-accounts/:bankAccountId
	@Patch('/:bankAccountId')
	public async edit(
		@Param('bankAccountId') bankAccountId: string,
		@Body(ValidationPipe) body: EditBankAccountDTO,
		@Req() req: NextApiRequest
	): Promise<{ ok: 1 }> {
		const user = await getUserFromDB(req);
		await prisma.userBankAccount.updateMany({
			where: {
				id: bankAccountId,
				userId: user.id,
			},
			data: {
				label: body.label ?? undefined,
			},
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { updatedAt: new Date() },
		});
		return { ok: 1 };
	}

	@Delete('/:bankAccountId')
	public async remove(
		@Param('bankAccountId') bankAccountId: string,
		@Req() req: NextApiRequest
	): Promise<{ ok: 1 }> {
		const user = await getUserFromDB(req);
		const { mangoClient, mangopayUserId, useSandbox } =
			getPaymentContextForUser(user);
		if (!mangopayUserId) {
			throw new Error('Mangopay account missing');
		}
		const systemUserOwner = await getSystemUser('OWNER', { useSandbox });
		const userBankAccount = await getUserBankAccount(
			user.id,
			bankAccountId
		);
		await mangoClient.Users.deactivateBankAccount(
			systemUserOwner.mangopayId,
			userBankAccount.mangopayBankAccountId
		);
		await prisma.userBankAccount.updateMany({
			where: {
				userId: user.id,
				mangopayBankAccountId: userBankAccount.mangopayBankAccountId,
			},
			data: {
				disabled: true,
			},
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { updatedAt: new Date() },
		});
		return { ok: 1 };
	}

	// GET /api/payment/mangopay/bank-accounts/:bankAccountId/transactions
	@Get('/:bankAccountId/transactions')
	public async getTransactions(
		@Param('bankAccountId') bankAccountId: string,
		@Req() req: NextApiRequest
	): Promise<Mangopay.transaction.TransactionData[]> {
		const user = await getUserFromDB(req);
		const { mangoClient, mangopayUserId } = getPaymentContextForUser(user);
		if (!mangopayUserId) {
			throw new Error('Mangopay account missing');
		}
		const userBankAccount = await getUserBankAccount(
			user.id,
			bankAccountId
		);
		if (!userBankAccount || !userBankAccount.mangopayBankAccountId) {
			throw new UnauthorizedException('Bank account not found');
		}
		const params = {
			// Status: 'SUCCEEDED',
			// Type: 'PAYOUT',
		};
		// TODO: paginate on the client
		const firstPageResponse =
			await mangoClient.BankAccounts.getTransactions(
				userBankAccount.mangopayBankAccountId,
				{
					parameters: {
						...params,
						per_page: 100,
						Page: 1,
					},
					resolveWithFullResponse: true,
				}
			);
		const numberOfPages = Number(
			firstPageResponse.headers['x-number-of-pages'] ?? 1
		);
		let transactions = firstPageResponse.body ?? [];
		let currentPage = 1;
		while (currentPage++ <= numberOfPages) {
			transactions = [
				...transactions,
				...(await mangoClient.BankAccounts.getTransactions(
					userBankAccount.mangopayBankAccountId,
					{
						parameters: {
							...params,
							per_page: 100,
							Page: currentPage,
						},
					}
				)),
			];
		}
		return transactions.reverse();
	}

	// POST /api/payment/mangopay/bank-accounts/:bankAccountId/transactions/payout
	@Post('/:bankAccountId/transactions/payout')
	public async payout(
		@Param('bankAccountId') bankAccountId: string,
		@Body(ValidationPipe) body: BankAccountPayoutDTO,
		@Req() req: NextApiRequest
	): Promise<{ ok: 1 }> {
		const user = await getUserFromDB(req);
		await payout(user, body, bankAccountId);
		return { ok: 1 };
	}
}

export default createHandler(BankAccountsHandler);
