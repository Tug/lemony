import prisma, {
	Prisma,
	orderForProjectIncludes,
	projectForCheckoutIncludes,
	SchemaTypes,
} from '../prismadb';
import { getSystemUser, mangopayMoneyToDecimal } from '../payment/utils';
import { getPaymentContextForUser, Mango } from '../payment/client';
import { Decimal } from 'decimal.js';
import { getSellerUserForProject } from '../user';
import { executeTransfer } from '../payment';
import Mangopay from 'mangopay2-nodejs-sdk';
import { payoutUserWithFallback } from './refund';
import { eurNumber } from '@diversifiedfinance/app/components/checkout/currency-utils';

export async function checkFundExits(
	project: SchemaTypes.Project,
	{
		useSandbox = false,
		fake = false,
		refPattern,
		exitPrice,
	}: {
		useSandbox?: boolean;
		fake?: boolean;
		refPattern?: RegExp | string;
		exitPrice?: Decimal.Value;
	} = {}
) {
	// project has not been paid, funds are still in the wallet
	if (!project.paid) {
		return;
	}
	// funds already assigned to project wallet
	if (project.exitFundsTxDate) {
		return;
	}
	// update exitPrice and exitDate if exitPrice is given
	// it's a safeguard, without it the project won't be exited
	if (!project.exitPrice && exitPrice && !fake) {
		await prisma.project.update({
			where: {
				id: project.id,
			},
			data: {
				exitPrice,
				exitDate: new Date(),
			},
		});
		project.exitPrice = new Decimal(exitPrice);
	}
	const seller = await getSellerUserForProject(project.id);
	const { mangoClient, mangopayWalletId } = getPaymentContextForUser(seller, {
		paymentSandbox: useSandbox,
	});
	if (!mangopayWalletId) {
		throw new Error('Mangopay wallet missing for seller');
	}
	const transactions = await mangoClient.Wallets.getTransactions(
		mangopayWalletId,
		{
			parameters: {
				Type: 'PAYIN',
				PaymentType: 'BANK_WIRE',
				Status: 'SUCCEEDED',
				Sort: 'CreationDate:DESC',
			},
		}
	);
	const payins: Mangopay.payIn.BankWireDirectPayInData[] = await Promise.all(
		transactions.map(
			async (payin) =>
				(await mangoClient.PayIns.get(
					payin.Id
				)) as Mangopay.payIn.BankWireDirectPayInData
		)
	);
	const matchingPayins = payins.filter(({ CreditedFunds, WireReference }) =>
		refPattern
			? new RegExp(refPattern).test(WireReference)
			: WireReference?.includes(project.tokenSymbol)
	);
	console.log(
		`matching payins for wallet ${mangopayWalletId}`,
		matchingPayins
	);
	const totalPayinsAmountCent = matchingPayins.reduce(
		(acc, { CreditedFunds: { Amount: amountCent } }) => acc + amountCent,
		0
	);
	if (!project.exitPrice) {
		console.error('Project exit price missing', project.id);
		return;
	}
	if (!mangopayMoneyToDecimal(totalPayinsAmountCent).eq(project.exitPrice)) {
		console.log(
			`no payin matched, ${eurNumber(
				mangopayMoneyToDecimal(totalPayinsAmountCent)
			)} !== ${eurNumber(project.exitPrice)}`
		);
		return;
	}
	console.log(`payins matched for ${totalPayinsAmountCent}`, matchingPayins);
	const destinationWalletId = useSandbox
		? project.sandboxMangopayWalletId
		: project.mangopayWalletId;
	if (!destinationWalletId) {
		throw new Error('Project is missing a wallet');
	}
	if (fake) {
		return;
	}
	let transfer = await executeTransfer(
		seller,
		{
			toWalletId: destinationWalletId,
			amountInCent: totalPayinsAmountCent,
		},
		undefined,
		'Exit funds credited to project wallet',
		{ paymentSandbox: useSandbox },
		'OWNER'
	);
	if (transfer.Status === 'CREATED') {
		await new Promise((resolve) => setTimeout(resolve, 500));
		transfer = await mangoClient.Transfers.get(transfer.Id);
	}
	if (transfer.Status === 'FAILED') {
		throw new Error(transfer.ResultMessage);
	}
	if (!useSandbox) {
		await prisma.project.update({
			where: {
				id: project.id,
			},
			data: {
				exitFundsTxId: payins[0].Id,
				exitFundsTxDate: new Date(payins[0].CreationDate * 1000),
			},
		});
	}
}

export async function exitOrder({
	orderId,
	useSandbox = false,
	exitReason = 'Asset sold',
	creditUserBankAccount = false,
	verbose = false,
}: {
	orderId?: string;
	useSandbox?: boolean;
	exitReason?: string;
	creditUserBankAccount?: boolean;
	verbose?: boolean;
}) {
	const orderCollection = useSandbox ? prisma.sandboxOrder : prisma.order;
	const order = await orderCollection.findUniqueOrThrow({
		where: {
			id: orderId,
		},
		include: orderForProjectIncludes,
	});
	if (order.type !== 'BUY') {
		if (verbose) {
			console.error('Only BUY orders can be exited');
		}
		return;
	}
	if (
		order.paymentStatus !== 'SUCCEEDED' &&
		order.paymentStatus !== 'REFUNDED'
	) {
		if (verbose) {
			console.error('Only SUCCEEDED payment status orders can be exited');
		}
		return;
	}
	if (
		order.fundsSource !== 'WALLET_EUR' ||
		order.executionType !== 'INITIAL'
	) {
		throw new Error('Unsupported funds source');
	}
	if (order.status === 'pendingExit') {
		await prisma.$transaction(async (tx) => {
			// TODO: implement exit order
			throw new Error('NOT IMPLEMENTED');
			if (verbose) {
				console.log('Refunded order', order.id);
				console.log('Undoing crowdfund project...');
			}
			if (verbose) {
				console.log('Project crowdfund undone.');
			}
		});
	}
	// TODO: check if user has IBAN and credit user bank account
	if (creditUserBankAccount && order.paymentStatus !== 'REFUNDED') {
		await prisma.$transaction(async (tx) => {
			try {
				if (verbose) {
					console.log('Trying payin refund...');
				}
				await payoutUserWithFallback(
					order.userId,
					order.amount,
					order.createdAt,
					{
						useSandbox,
						refundReason: exitReason,
					},
					tx
				);
			} catch (error) {
				if (verbose) {
					console.error('Payin refund failed', error);
				}
			}
		});
	}
	// TODO: also remove user labels and benefits linked to this order
}

export async function exitProject({
	projectId,
	exitPrice,
	exitDate,
	creditUserNow = false,
	useSandbox = false,
}: {
	projectId: string;
	exitPrice: Decimal.Value;
	exitDate?: Date;
	creditUserNow: boolean;
	emailTemplateId?: string;
	useSandbox?: boolean;
}) {
	if (useSandbox) {
		await prisma.sandboxOrder.updateMany({
			where: {
				projectId,
				status: {
					in: ['paid', 'processed'],
				},
			},
			data: {
				status: 'pendingExit',
			},
		});
	} else {
		await prisma.$transaction([
			prisma.project.update({
				where: {
					id: projectId,
				},
				data: {
					exitDate: exitDate ?? new Date(),
					exitPrice,
				},
			}),
			prisma.order.updateMany({
				where: {
					projectId,
					status: {
						in: ['paid', 'processed'],
					},
				},
				data: {
					status: 'pendingExit',
				},
			}),
		]);
	}
	// try {
	// 	await checkFundExits(projectId);
	// } catch (error) {
	// 	console.error('Failed to check fund exits', error);
	// }
	if (creditUserNow) {
		const orderCollection = useSandbox ? prisma.sandboxOrder : prisma.order;
		const orders = await orderCollection.findMany({
			where: {
				projectId,
				status: 'pendingExit',
				project: {
					NOT: { exitFundsTxId: null },
				},
			},
			select: {
				id: true,
			},
		});
		for (const order of orders) {
			await exitOrder({ orderId: order.id, useSandbox });
		}
	}
}

export async function processPendingExits({
	limit = 50,
	daysOnWallet = 3,
}: {
	limit: number;
	daysOnWallet: number;
}) {
	const orders = await prisma.order.findMany({
		where: {
			status: 'pendingExit',
			project: {
				NOT: { exitFundsTxId: null },
			},
		},
		take: limit,
		select: {
			id: true,
		},
	});
	for (const order of orders) {
		await exitOrder({ orderId: order.id, useSandbox: false });
	}
	const sandboxOrders = await prisma.sandboxOrder.findMany({
		where: {
			status: 'pendingExit',
			project: {
				NOT: { exitFundsTxId: null },
			},
		},
		take: limit,
		select: {
			id: true,
		},
	});
	for (const order of sandboxOrders) {
		await exitOrder({ orderId: order.id, useSandbox: true });
	}
}
