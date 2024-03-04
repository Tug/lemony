import prisma, {
	Prisma,
	orderForProjectIncludes,
	OrderForProject,
	SchemaTypes,
	projectForCheckoutIncludes,
} from '../prismadb';
import { decimalToMangopayMoney } from '../payment/utils';
import { getPaymentContextForUser, Mango } from '../payment/client';
import { Decimal } from 'decimal.js';
import { DEFAULT_TOKEN_DECIMALS } from '@diversifiedfinance/app/lib/constants';
import { sendEmailToUserWithTemplate, TemplateId } from '../emails/sendgrid';
import { printMoney } from '@diversifiedfinance/app/lib/money';
import { difiedNumber } from '@diversifiedfinance/app/components/checkout/currency-utils';
import { dispatchNotification } from '../notifications';
import { getEurWallet } from '../payment';
import {
	createBankAccount,
	getUserBankAccount,
	payout,
} from '../payment/bank-account';
import { checkFundExits } from './exit';

export async function refundOrderOnUnpaidProject(
	order: OrderForProject,
	{
		refundReason = 'Refund requested from user',
		useSandbox = false,
	}: { refundReason: string; useSandbox?: boolean },
	tx: Prisma.TransactionClient = prisma
) {
	if (!order.paymentId) {
		throw new Error('Order has no payment id');
	}
	const orderCollection = useSandbox ? tx.sandboxOrder : tx.order;
	await orderCollection.update({
		where: {
			id: order.id,
		},
		data: {
			status: 'refunded',
		},
	});
	const mangoClient = Mango.getDefaultClient({ useSandbox });
	const transfer = await mangoClient.Transfers.get(order.paymentId);
	const existingRefunds = await mangoClient.Transfers.getRefunds(transfer.Id);
	const hasRefund = existingRefunds.find(
		(refund) =>
			refund.Status === 'SUCCEEDED' &&
			refund.CreditedFunds.Amount === transfer.DebitedFunds.Amount
	);
	if (hasRefund) {
		throw new Error(
			`Order ${order.id} has already been refunded. Refund Transfer id ${hasRefund.Id}`
		);
	}
	console.log(`Cancelling order ${order.id} to refund the user.`);
	let refund = await mangoClient.Transfers.createRefund(transfer.Id, {
		AuthorId: transfer.AuthorId,
		Tag: `Cancel order ${order.id} to refund the user`,
	});
	if (refund.Status === 'FAILED') {
		throw new Error(refund.ResultMessage);
	}
	if (refund.Status === 'CREATED') {
		await new Promise((resolve) => setTimeout(resolve, 500));
		refund = await mangoClient.Refunds.get(refund.Id);
		if (refund.Status === 'FAILED') {
			throw new Error(refund.ResultMessage);
		}
		if (refund.Status === 'CREATED') {
			throw new Error('Mango refund did not happen in time');
		}
	}
	return refund;
}

export async function refreshCrowdfundProject(
	projectId: string,
	tx: Prisma.TransactionClient = prisma
) {
	await tx.$queryRaw`
		UPDATE projectcrowdfundingstate pcs
		SET "collectedAmount" = COALESCE((
		  SELECT SUM(o."quantityInDecimal" * p."tokenPrice" / POWER(10, p."tokenDecimals"))
		  FROM orders o
		  JOIN projects p ON o."projectId" = p.id
		  WHERE p.id = ${projectId}
			AND o.type = 'BUY'
			AND o."executionType" = 'INITIAL'
			AND o.status IN ('processed', 'paid', 'preprocessed', 'prepaid', 'pendingRefund', 'pendingExit')
		), 0)
		WHERE pcs.id = (SELECT "crowdfundingStateId" FROM projects WHERE id = ${projectId});
	`;
}

export async function payoutUserWithFallback(
	user: SchemaTypes.User,
	amount: Decimal.Value,
	atTime: Date,
	{
		useSandbox = false,
		refundReason = 'Refund requested from user',
	}: {
		useSandbox?: boolean;
		refundReason?: string;
	} = {}
) {
	const eurWallet = await getEurWallet(user);
	if (!eurWallet) {
		throw new Error('User has no EUR wallet');
	}
	const bankAccount = await getUserBankAccount(user.id);
	if (!bankAccount) {
		console.log(
			`No bank account found for user ${user.id}, trying to refund from payins...`
		);
		await tryRefundFromPayins(user, amount, atTime, {
			useSandbox,
			refundReason,
		});
		return;
	}
	const amountCent = new Decimal(amount).times(100).toNumber();
	if (useSandbox) {
		throw new Error(
			`Skipping payout of ${amountCent} cents since we are in sandbox mode`
		);
	}
	let payoutData = await payout(user, {
		amountCent,
		label: refundReason,
	});
	if (payoutData.Status === 'CREATED') {
		await new Promise((resolve) => setTimeout(resolve, 500));
		const { mangoClient } = getPaymentContextForUser(user);
		payoutData = await mangoClient.PayOuts.get(payoutData.Id);
	}
	if (payoutData.Status === 'FAILED') {
		throw new Error(payoutData.ResultMessage);
	}
}

const bicToBankName = {
	CMCIFRPP: 'Compte CIC',
	CRLYFRPPXXX: 'Compte LCL',
	SOGEFRPP: 'Compte Société Générale',
	CMCIFR2A: 'Compte Crédit Mutuel',
	FTNOFRP1XXX: 'Compte Fortuneo',
	BOUSFRPPXXX: 'Compte Boursorama Banque',
	PSSTFRPPXXX: 'Compte La Banque Postale',
	AGRIFRPPXXX: 'Compte Crédit Agricole',
	BNPAFRPPXXX: 'Compte BNP Paribas',
	REVOFRP2XXX: 'Compte Revolut',
	NTSBDEB1XXX: 'Compte N26',
	CCFRFRPPXXX: 'Compte HSBC',
	BFBKFRP1: 'Compte Bforbank',
};

// if executed in a cron job,
// we should make sure to refund the oldest orders first,
// so we only look at payins in the past of a transaction
export async function tryRefundFromPayins(
	userToRefund: SchemaTypes.User,
	amount: Decimal.Value,
	atTime: Date,
	{
		useSandbox = false,
		refundReason = 'Refund requested from user',
	}: {
		useSandbox?: boolean;
		refundReason?: string;
	} = {}
) {
	const { mangoClient, mangopayUserId, mangopayWalletId } =
		getPaymentContextForUser(userToRefund, {
			paymentSandbox: useSandbox,
		});
	if (!mangopayUserId || !mangopayWalletId) {
		throw new Error('Mangopay account missing');
	}

	// Calculate the timestamp for 11 months before atTime
	const elevenMonthsBefore = new Date(atTime);
	elevenMonthsBefore.setMonth(atTime.getMonth() - 11);

	// const payins = await mangoClient.Users.getTransactions(mangopayUserId, {
	// 	parameters: {
	// 		Status: 'SUCCEEDED',
	// 		Type: 'PAYIN',
	// 		BeforeDate: Math.floor(atTime.getTime() / 1000),
	// 		AfterDate: Math.floor(elevenMonthsBefore.getTime() / 1000),
	// 		Sort: 'CreationDate:DESC',
	// 	},
	// });
	const transactions = await mangoClient.Wallets.getTransactions(
		mangopayWalletId,
		{
			parameters: {
				Status: 'SUCCEEDED',
				Type: 'PAYIN',
				BeforeDate: Math.floor(atTime.getTime() / 1000),
				AfterDate: Math.floor(elevenMonthsBefore.getTime() / 1000),
				Sort: 'CreationDate:DESC',
			},
		}
	);
	const payins = await Promise.all(
		transactions.map((payin) => mangoClient.PayIns.get(payin.Id))
	);
	console.log('Payins:', payins);
	return;
	const bankWirePayin = payins.find(
		({ PaymentType, DebitedBankAccount }) =>
			PaymentType === 'BANK_WIRE' && DebitedBankAccount.Type === 'IBAN'
	);
	if (bankWirePayin) {
		const bankAccountLabel =
			bicToBankName[bankWirePayin.DebitedBankAccount.BIC] ??
			'Bank Account';
		const bankAccount = await createBankAccount(
			userToRefund,
			{
				iban: bankWirePayin.DebitedBankAccount.IBAN,
				bic: bankWirePayin.DebitedBankAccount.BIC,
				label: bankAccountLabel,
			},
			{ forceCreate: true }
		);
		const amountCent = new Decimal(amount).times(100).toNumber();
		if (useSandbox) {
			console.log(
				`Skipping payout of ${amountCent} cents since we are in sandbox mode`
			);
			return;
		}
		await payout(
			userToRefund,
			{
				amountCent,
				label: refundReason,
			},
			bankAccount.mangopayBankAccountId
		);
		return;
	}

	let totalRefunded = 0;
	const amountToRefund = decimalToMangopayMoney(amount);
	const refunds = [];

	for (const payin of payins) {
		if (totalRefunded >= amountToRefund) break;
		const refundAmount = Math.min(
			payin.CreditedFunds.Amount,
			amountToRefund - totalRefunded
		);

		let refund = await mangoClient.PayIns.createRefund(payin.Id, {
			AuthorId: payin.AuthorId,
			Tag: `Refund of external user ${userToRefund.id} for payin ${payin.Id}`,
			DebitedFunds: {
				Amount: refundAmount,
				Currency: 'EUR',
			},
			Fees: {
				Amount: 0,
				Currency: 'EUR',
			},
		});

		if (refund.Status === 'CREATED') {
			await new Promise((resolve) => setTimeout(resolve, 500));
			refund = await mangoClient.Refunds.get(refund.Id);
		}

		if (refund.Status === 'FAILED') {
			console.error(refund.ResultMessage);
			continue;
		}

		totalRefunded += refundAmount;
		refunds.push(refund);
	}

	if (totalRefunded < amountToRefund) {
		throw new Error('Insufficient funds to refund the requested amount');
	}

	return refunds;
}

export async function userHasMadePaymentSinceOrderUpdate(
	user: SchemaTypes.User,
	order: SchemaTypes.Order,
	extraSeconds = 0
) {
	const { mangoClient, mangopayWalletId } = getPaymentContextForUser(user);
	if (!mangopayWalletId) {
		throw new Error('Mangopay account missing');
	}
	const transactions = await mangoClient.Wallets.getTransactions(
		mangopayWalletId,
		{
			parameters: {
				Status: 'SUCCEEDED',
				Type: 'TRANSFER,PAYOUT',
				AfterDate: Math.floor(
					order.updatedAt.getTime() / 1000 + extraSeconds
				),
			},
		}
	);
	const transfersOut = transactions.filter(
		({ DebitedWalletId }) => DebitedWalletId === mangopayWalletId
	);
	return transfersOut.length > 0;
}

export async function refundOrder({
	orderId,
	useSandbox = false,
	force = false,
	refundReason = 'Refund requested from user',
	refundPayment = false,
	verbose = false,
	emailTemplateId,
}: {
	orderId?: string;
	useSandbox?: boolean;
	force?: boolean;
	refundReason?: string;
	refundPayment?: boolean;
	verbose?: boolean;
	emailTemplateId?: string;
}) {
	const orderCollection = useSandbox ? prisma.sandboxOrder : prisma.order;
	let order = await orderCollection.findUniqueOrThrow({
		where: {
			id: orderId,
		},
		include: {
			...orderForProjectIncludes,
			user: true,
		},
	});
	if (order.project.paid && !order.project.exitFundsTxDate) {
		if (verbose) {
			console.error('Cannot refund orders from paid projects');
		}
		return;
	}
	if (order.type !== 'BUY') {
		if (verbose) {
			console.error('Only BUY orders can be refunded');
		}
		return;
	}
	if (
		order.paymentStatus !== 'SUCCEEDED' &&
		order.paymentStatus !== 'REFUNDED'
	) {
		if (verbose) {
			console.error(
				'Only SUCCEEDED or REFUNDED payment status orders can be refunded'
			);
		}
		return;
	}
	if (
		!['WALLET_EUR', 'FREE_CREDITS'].includes(order.fundsSource) ||
		order.executionType !== 'INITIAL'
	) {
		console.error(
			`Unsupported funds source ${order.fundsSource} or execution type ${order.executionType}`
		);
		return;
	}
	if (
		force &&
		(order.status === 'preprocessed' || order.status === 'prepaid')
	) {
		order = await orderCollection.update({
			where: {
				id: orderId,
			},
			data: {
				status: 'pendingRefund',
			},
			include: {
				...orderForProjectIncludes,
				user: true,
			},
		});
	}
	if (order.status === 'pendingRefund') {
		await prisma.$transaction(async (tx) => {
			await refundOrderOnUnpaidProject(
				order,
				{ refundReason, useSandbox },
				tx
			);
			if (!useSandbox) {
				if (verbose) {
					console.log('Refunded order', order.id);
					console.log('Undoing crowdfund project...');
				}
				await refreshCrowdfundProject(order.projectId, tx);
				if (verbose) {
					console.log('Project crowdfund undone.');
				}
			}
		});
		if (verbose) {
			console.log('Sending transactional email to user.');
		}
		const tokenQuantity = difiedNumber(
			new Decimal(order.quantityInDecimal.toString()).div(
				Math.pow(
					10,
					order.project.tokenDecimals ?? DEFAULT_TOKEN_DECIMALS
				)
			)
		);
		const amountEur = printMoney(order.amount, 'EUR', {
			language: order.user.locale ?? 'en',
		});
		const template =
			(emailTemplateId as TemplateId) ??
			(order.project.isPresale ? 'PREORDER_REFUND' : 'ORDER_REFUND');
		await sendEmailToUserWithTemplate({
			template,
			user: order.user,
			customVars: {
				amount: amountEur,
				dified_amount: tokenQuantity,
				project: order.project.tokenName,
				useSandbox,
				// bank_account_label:
				// iban:
			},
		});
		if (verbose) {
			console.log('Sending notification to user.');
		}
		await dispatchNotification({
			recipientId: order.userId,
			type: 'marketing_general',
			content: {
				title: 'Refund Processed for {{ project }}',
				description: order.project.isPresale
					? 'Your presale refund of {{ amount }} has returned to your wallet.'
					: 'You were refunded {{ amount }} for {{ project }}.',
				vars: { amount: amountEur, project: order.project.title },
			},
		});
	}
	if (
		refundPayment &&
		order.status === 'refunded' &&
		order.paymentStatus !== 'REFUNDED'
	) {
		try {
			if (verbose) {
				console.log(
					`Trying payin refund on wallet ${order.user.mangopayWalletId}...`
				);
			}
			if (
				!(await userHasMadePaymentSinceOrderUpdate(
					order.user,
					order,
					600
				))
			) {
				await payoutUserWithFallback(
					order.user,
					order.amount,
					order.createdAt,
					{
						useSandbox,
						refundReason,
					}
				);
				if (verbose) {
					console.log('Payin refund succeeded');
				}
			} else if (verbose) {
				console.log('User has made a payment since the order update');
			}
			console.log('Updating order to REFUNDED', order.id);
			await prisma.order.update({
				where: {
					id: order.id,
				},
				data: {
					paymentStatus: 'REFUNDED',
				},
			});
		} catch (error) {
			if (verbose) {
				console.error('Payin refund failed', error);
			}
		}
	}
	// TODO: also remove user labels and benefits linked to this order
}

const regexFromString = (input?: string) => {
	if (!input) {
		return undefined;
	}
	const flags = input.replace(/.*\/([gimy]*)$/, '$1');
	const pattern = input.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
	return new RegExp(pattern, flags);
};

export async function refundProject({
	projectId,
	failed = false,
	refundOrdersNow = false,
	refundPaymentsNow = false,
	useSandbox = false,
	verbose = false,
	emailTemplateId,
	wireRefPattern,
	exitPrice,
}: {
	projectId: string;
	failed?: boolean;
	refundOrdersNow?: boolean;
	refundPaymentsNow?: boolean;
	useSandbox?: boolean;
	verbose?: boolean;
	emailTemplateId?: string;
	wireRefPattern?: string;
	exitPrice?: Decimal.Value;
}) {
	const project = await prisma.project.findUniqueOrThrow({
		where: {
			id: projectId,
		},
	});
	if (verbose) {
		console.log('Checking exit funds...');
	}
	await checkFundExits(project, {
		useSandbox,
		refPattern: regexFromString(wireRefPattern),
		exitPrice,
	});
	if (verbose) {
		console.log('Exit funds checked.');
	}
	const validOrderStatus: SchemaTypes.OrderStatus[] = project.isPresale
		? ['prepaid', 'preprocessed']
		: ['paid', 'processed'];
	if (useSandbox) {
		await prisma.sandboxOrder.updateMany({
			where: {
				projectId,
				status: {
					in: validOrderStatus,
				},
			},
			data: {
				status: 'pendingRefund',
			},
		});
	} else {
		await prisma.$transaction([
			prisma.project.update({
				where: {
					id: projectId,
				},
				data: {
					failed,
				},
			}),
			prisma.order.updateMany({
				where: {
					projectId,
					status: {
						in: validOrderStatus,
					},
				},
				data: {
					status: 'pendingRefund',
				},
			}),
		]);
	}
	if (refundOrdersNow) {
		const orderCollection = useSandbox ? prisma.sandboxOrder : prisma.order;
		const orders = await orderCollection.findMany({
			where: {
				projectId,
				status: 'pendingRefund',
			},
			select: {
				id: true,
			},
		});
		if (verbose && orders.length > 0) {
			console.log(`Refunding ${orders.length} orders...`);
		}
		for (const order of orders) {
			if (verbose) {
				console.log(`Refunding order ${order.id}...`);
			}
			await refundOrder({
				orderId: order.id,
				useSandbox,
				refundPayment: refundPaymentsNow,
				refundReason: failed ? 'Project failed' : 'Project refunded',
				verbose,
				emailTemplateId,
			});
		}
	}
}

export async function processPendingRefunds({
	limit = 100,
	daysOnWallet = 3,
	verbose = true,
}: {
	limit?: number;
	daysOnWallet?: number;
	verbose?: boolean;
} = {}) {
	const orders = await prisma.order.findMany({
		where: {
			status: 'pendingRefund',
		},
		take: limit,
		select: {
			id: true,
		},
	});
	for (const order of orders) {
		await refundOrder({ orderId: order.id, useSandbox: false });
	}
	const sandboxOrders = await prisma.sandboxOrder.findMany({
		where: {
			status: 'pendingRefund',
		},
		take: limit,
		select: {
			id: true,
		},
	});
	for (const order of sandboxOrders) {
		await refundOrder({ orderId: order.id, useSandbox: true });
	}
	const paymentOrders = await prisma.order.findMany({
		where: {
			status: 'refunded',
			paymentStatus: 'SUCCEEDED',
			updatedAt: {
				lte: new Date(Date.now() - 1000 * 3600 * 24 * daysOnWallet),
			},
		},
		take: limit,
		select: {
			id: true,
		},
	});
	for (const order of paymentOrders) {
		await refundOrder({
			orderId: order.id,
			useSandbox: false,
			refundPayment: true,
			verbose,
		});
	}
	const sandboxPaymentOrders = await prisma.sandboxOrder.findMany({
		where: {
			status: 'refunded',
			paymentStatus: 'SUCCEEDED',
			updatedAt: {
				lte: new Date(Date.now() - 1000 * 3600 * 24 * daysOnWallet),
			},
		},
		take: limit,
		select: {
			id: true,
		},
	});
	for (const order of sandboxPaymentOrders) {
		await refundOrder({
			orderId: order.id,
			useSandbox: true,
			refundPayment: true,
			verbose,
		});
	}
}
