/**
 * TODO NEXT: test integration with client + add automated tests
 */
import prisma, {
	Prisma,
	SchemaTypes,
	Decimal,
	UserWithWallets,
	transactionWithRetry,
	UserForCheckout,
} from '../prismadb';
import Mangopay from 'mangopay2-nodejs-sdk';
import { ensureEurWallet } from './sync';
import {
	dbAddressToMangopayAddress,
	decimalToMangopayMoney,
	getSystemUser,
	mangopayMoneyToDecimal,
	nameUUIDFromBytes,
} from './utils';
import { getPaymentContextForUser, Mango } from './client';
import { CheckoutError } from '../error';
import { getSellerUser } from '../user';
import { processPendingPayment } from './cron';
import { FundsSourceType, PrismaClient } from '@prisma/client';
import { initiateCreditTransfer } from './credits';
import { getProjectPercent } from '../project/utils';

export const PAYMENT_REDIRECT_URI = `${
	process.env.STAGE === 'development' ? 'http' : 'https'
}://${
	process.env.NEXT_PUBLIC_WEBSITE_DOMAIN ?? 'app.diversified.fi'
}/payment-redirect`;

export const getUserWithEWalletAndCards = async (user: UserWithWallets) => {
	const {
		mangoClient,
		mangopayUserId,
		mangopayWalletId,
		mangopayCreditsWalletId,
	} = getPaymentContextForUser(user);
	if (!mangopayUserId) {
		throw new Error('Mangopay account missing');
	}
	const mangopayUser = await mangoClient.Users.getNatural(mangopayUserId);
	const wallet = mangopayWalletId
		? await mangoClient.Wallets.get(mangopayWalletId)
		: null;
	const creditsWallet = mangopayCreditsWalletId
		? await mangoClient.Wallets.get(mangopayCreditsWalletId)
		: null;
	const cards = await mangoClient.Users.getCards(mangopayUserId);

	return {
		...mangopayUser,
		eWallets: [wallet, creditsWallet].filter(Boolean),
		cards,
	};
};

export const getCardRegistrationData = async (
	user: UserWithWallets,
	{ cardType }: { cardType: Mangopay.card.CardType }
): Promise<Mangopay.cardRegistration.CardRegistrationData> => {
	const { mangoClient, mangopayUserId } = getPaymentContextForUser(user);
	if (!mangopayUserId) {
		throw new Error('Mangopay account missing');
	}
	const cardRegistration = new mangoClient.models.CardRegistration({
		UserId: mangopayUserId,
		Currency: 'EUR',
		CardType: cardType,
	});
	return await mangoClient.CardRegistrations.create(cardRegistration);
};

export const updateCardRegistration = async (
	user: UserWithWallets,
	cardRegistration: Mangopay.cardRegistration.CardRegistrationData
) => {
	const { mangoClient } = getPaymentContextForUser(user);
	return await mangoClient.CardRegistrations.update(cardRegistration);
};

export const registerExternalBankAccount = async (
	user: UserWithWallets,
	{ IBAN, BIC }: { IBAN: string; BIC: string }
) => {
	const { mangoClient, mangopayUserId } = getPaymentContextForUser(user);
	if (!mangopayUserId) {
		throw new Error('Mangopay account missing');
	}
	const bankAccount = new mangoClient.models.BankAccountDetailsIBAN({
		Type: 'IBAN',
		OwnerAddress: dbAddressToMangopayAddress(
			mangoClient,
			user.address ?? undefined
		),
		OwnerName: `${user.firstName} ${user.lastName}`.trim(),
		IBAN,
		BIC,
	});
	return await mangoClient.Users.createBankAccount(
		mangopayUserId,
		bankAccount
	);
};

export const listRegisteredBankAccounts = async (
	user: UserWithWallets,
	{ IBAN, BIC }: { IBAN: string; BIC: string }
) => {
	const { mangoClient, mangopayUserId } = getPaymentContextForUser(user);
	if (!mangopayUserId) {
		throw new Error('Mangopay account missing');
	}
	return await mangoClient.Users.getBankAccounts(mangopayUserId);
};

export async function creditOwnWalletWithCard({
	user,
	cardId,
	amountCent,
	currency,
	ipAddress,
	browserInfo,
}: {
	user: UserWithWallets;
	cardId: string;
	amountCent: number;
	currency: Mangopay.CurrencyISO;
	ipAddress: string;
	browserInfo: Mangopay.base.BrowserInfoData;
}): Promise<Mangopay.payIn.CardDirectPayInData> {
	const eurWallet = await getEurWalletOrThrow(user);
	if (cardId) {
		await setActiveCard(user, cardId);
	}
	return creditWalletWithCard({
		cardOwner: user,
		walletId: eurWallet.Id,
		cardId,
		amountCent,
		currency,
		ipAddress,
		browserInfo,
	});
}

export async function creditWalletWithCard({
	cardOwner,
	walletId,
	cardId,
	amountCent,
	currency = 'EUR',
	feesCent = 0,
	ipAddress,
	browserInfo,
	statementDescriptor = 'DIVERSIFIED'.substring(0, 10),
	tag = undefined,
}: {
	cardOwner: UserWithWallets;
	walletId: string;
	cardId: string;
	amountCent: number;
	currency?: Mangopay.CurrencyISO;
	feesCent?: number;
	ipAddress: string;
	browserInfo: Mangopay.base.BrowserInfoData;
	statementDescriptor?: string;
	tag?: string;
}): Promise<Mangopay.payIn.CardDirectPayInData> {
	const { mangoClient, mangopayUserId, useSandbox } =
		getPaymentContextForUser(cardOwner);
	// if (!cardOwner.address) {
	// 	throw new Error('Billing Address missing for user');
	// }
	const secureModeReturnURL = new URL(PAYMENT_REDIRECT_URI);
	secureModeReturnURL.searchParams.append('cardId', cardId);
	if (useSandbox) {
		secureModeReturnURL.searchParams.append('sandbox', 'true');
	}
	return mangoClient.PayIns.create({
		ExecutionType: 'DIRECT',
		PaymentType: 'CARD',
		AuthorId: mangopayUserId,
		CreditedWalletId: walletId,
		DebitedFunds: {
			Amount: amountCent,
			Currency: currency,
		},
		Fees: {
			Amount: feesCent,
			Currency: currency,
		},
		// NO_CHOICE does not seem to work in sandbox (for testing)
		// SecureMode:
		// 	process.env.NODE_ENV === 'production' ? 'FORCE' : 'NO_CHOICE',
		SecureMode: 'FORCE',
		SecureModeReturnURL: secureModeReturnURL.href,
		CardId: cardId,
		// Billing: {
		// 	FirstName: cardOwner.firstName,
		// 	LastName: cardOwner.lastName,
		// 	Address: {
		// 		AddressLine1: cardOwner.address.addressLine1,
		// 		AddressLine2: cardOwner.address.addressLine2,
		// 		City: cardOwner.address.city,
		// 		Region: cardOwner.address.region,
		// 		PostalCode: cardOwner.address.postalCode,
		// 		Country: cardOwner.countryOfResidence,
		// 	},
		// },
		Culture: cardOwner.locale === 'fr' ? 'FR' : 'EN',
		IpAddress: ipAddress,
		StatementDescriptor: statementDescriptor,
		BrowserInfo: browserInfo,
		Tag: tag,
	} as Mangopay.payIn.CreateCardDirectPayIn);
}

export async function creditOwnWalletWithPaymentRequest({
	user,
	paymentType,
	paymentData,
	amountCent,
	currency,
}: {
	user: UserWithWallets;
	paymentType: 'APPLE_PAY' | 'GOOGLE_PAY';
	paymentData: {
		transactionId: string;
		network: 'VISA' | 'MASTERCARD' | 'AMEX';
		tokenData: string;
	};
	amountCent: number;
	currency: Mangopay.CurrencyISO;
}): Promise<Mangopay.payIn.CardDirectPayInData> {
	const eurWallet = await getEurWalletOrThrow(user);
	return creditWalletWithPaymentRequest({
		user,
		walletId: eurWallet.Id,
		paymentType,
		paymentData,
		amountCent,
		currency,
	});
}

export async function creditWalletWithPaymentRequest({
	user,
	walletId,
	paymentType,
	paymentData,
	amountCent,
	currency = 'EUR',
	feesCent = 0,
	statementDescriptor = 'DIVERSIFIED'.substring(0, 10),
	tag = undefined,
}: {
	user: UserWithWallets;
	walletId: string;
	paymentType: 'APPLE_PAY' | 'GOOGLE_PAY';
	paymentData: {
		transactionId: string;
		network: 'VISA' | 'MASTERCARD' | 'AMEX';
		tokenData: string;
	};
	amountCent: number;
	currency?: Mangopay.CurrencyISO;
	feesCent?: number;
	statementDescriptor?: string;
	tag?: string;
}): Promise<Mangopay.payIn.CardDirectPayInData> {
	const { mangoClient, mangopayUserId } = getPaymentContextForUser(user);
	const payin = await mangoClient.PayIns.create({
		ExecutionType: 'DIRECT',
		PaymentType: paymentType,
		AuthorId: mangopayUserId,
		CreditedWalletId: walletId,
		PaymentData: paymentData,
		DebitedFunds: {
			Amount: amountCent,
			Currency: currency,
		},
		Fees: {
			Amount: feesCent,
			Currency: currency,
		},
		StatementDescriptor: statementDescriptor,
		Tag: tag,
	});
	console.log('payin', payin);
	return payin;
}

export const getEurWalletOrThrow = async (
	user: UserWithWallets
): Promise<Mangopay.wallet.WalletData> => {
	let { mangoClient, mangopayWalletId } = getPaymentContextForUser(user);
	if (!mangopayWalletId) {
		await ensureEurWallet(user);
		const { mangopayWalletId: mangopayWalletIdUpdated } =
			getPaymentContextForUser(user);
		mangopayWalletId = mangopayWalletIdUpdated;
	}
	const eurWallet = await mangoClient.Wallets.get(mangopayWalletId!);
	if (!eurWallet) {
		throw new Error('EUR wallet missing on mangopay');
	}
	return eurWallet;
};

export const getEurWallet = async (
	user: UserForCheckout
): Promise<Mangopay.wallet.WalletData | null> => {
	const { mangoClient, mangopayWalletId } = getPaymentContextForUser(user);
	if (!mangopayWalletId) {
		return null;
	}
	const eurWallet = await mangoClient.Wallets.get(mangopayWalletId!);
	if (!eurWallet) {
		return null;
	}
	return eurWallet;
};

export const getMangoWalletsPublicInfo = async (user: UserWithWallets) => {
	const wallet = await getEurWalletOrThrow(user);
	const { mangoClient } = getPaymentContextForUser(user);

	// @ts-ignore
	const ibans: Mangopay.bankingAlias.IBANBankingAliasData[] =
		// @ts-ignore
		await mangoClient.BankingAliases.getAll(wallet.Id);

	return [
		{
			id: wallet.Id,
			balance: wallet.Balance?.Amount,
			currency: wallet.Currency,
			iban: ibans[0],
		},
	];
};

export async function executeTransfer(
	fromUser: UserForCheckout,
	{
		toWalletId,
		amountInCent,
		feesInCent = 0,
		useCredits = false,
	}: {
		toWalletId: string;
		amountInCent: number;
		feesInCent?: number;
		useCredits?: boolean;
	},
	orderId?: string,
	tag?: string,
	settingsOverride?: any,
	author: 'PAYER' | 'OWNER' = 'PAYER',
	tx?: Prisma.TransactionClient
) {
	const { mangoClient, mangopayUserId, mangopayWalletId, useSandbox } =
		getPaymentContextForUser(fromUser, settingsOverride);
	const systemUserAuthor = await getSystemUser(author, { useSandbox }, tx);
	const systemUserOwner = await getSystemUser('OWNER', { useSandbox }, tx);
	if (!mangopayUserId) {
		// TODO: translate those errors
		throw new CheckoutError(
			`User does not have a mango account for payment`,
			'USER_MANGO_ACCOUNT_MISSING'
		);
	}
	if (!mangopayWalletId) {
		throw new CheckoutError(
			`User does not have a mango wallet for payment`,
			'USER_MANGO_WALLET_MISSING'
		);
	}
	const debitedWalletId = useCredits
		? systemUserOwner.mangopayCreditsWalletId
		: mangopayWalletId;
	const transferAuthorId = useCredits
		? systemUserOwner.mangopayId
		: systemUserAuthor.mangopayId;
	if (!debitedWalletId) {
		throw new Error('Debit wallet not found');
	}
	const transfer = await mangoClient.Transfers.create(
		{
			AuthorId: transferAuthorId,
			CreditedUserId: systemUserOwner.mangopayId,
			DebitedFunds: {
				Currency: 'EUR',
				Amount: amountInCent,
			},
			Fees: {
				Currency: 'EUR',
				Amount: feesInCent,
			},
			DebitedWalletId: debitedWalletId,
			CreditedWalletId: toWalletId,
			Tag: tag,
		},
		orderId
			? {
					headers: {
						'Idempotency-Key': nameUUIDFromBytes(orderId),
					},
			  }
			: undefined
	);
	return transfer;
}

export async function getTransfer(user: SchemaTypes.User, transferId: string) {
	const { mangoClient } = getPaymentContextForUser(user);
	return await mangoClient.Transfers.get(transferId);
}

export async function getPayin(user: SchemaTypes.User, payinId: string) {
	const { mangoClient } = getPaymentContextForUser(user);
	return await mangoClient.Transfers.get(payinId);
}

export async function getUserCards(user: SchemaTypes.User) {
	const { mangoClient, mangopayUserId } = getPaymentContextForUser(user);
	if (!mangopayUserId) {
		throw new Error('Mangopay account missing');
	}
	const cards = await mangoClient.Users.getCards(mangopayUserId, {
		parameters: {
			Active: 'true',
			Per_Page: 100,
		},
	});

	return cards.map((card) => ({
		...card,
		isLastUsed: user.mangopayActiveCardId === card.Id,
	}));
}

export async function checkUserCard(user: SchemaTypes.User, cardId: string) {
	const { mangoClient, mangopayUserId } = getPaymentContextForUser(user);
	if (!mangopayUserId) {
		throw new Error('Mangopay account missing');
	}
	const card = await mangoClient.Cards.get(cardId);
	if (!card) {
		throw new Error('Card does not exist');
	}
	if (card.UserId !== mangopayUserId) {
		throw new Error('User does not own card');
	}
}

export async function deactivateUserCard(
	user: SchemaTypes.User,
	cardId: string
) {
	await checkUserCard(user, cardId);
	const { mangoClient } = getPaymentContextForUser(user);
	const response = await mangoClient.Cards.update({
		Id: cardId,
		Active: false,
	});

	if (user.mangopayActiveCardId === cardId) {
		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				mangopayActiveCardId: null,
			},
		});
	}

	return response;
}

export async function setActiveCard(user: SchemaTypes.User, cardId: string) {
	return await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			mangopayActiveCardId: cardId,
		},
	});
}

export async function getTransactionForCard(
	cardId: string,
	transactionId: string,
	useSandbox: boolean = false
) {
	const mangoClient = Mango.getDefaultClient({ useSandbox });
	const firstPageResponse = await mangoClient.Cards.getTransactions(cardId, {
		resolveWithFullResponse: true,
	});
	const numberOfPages = Number(
		firstPageResponse.headers['x-number-of-pages'] ?? 1
	);
	let transactions;
	if (numberOfPages > 1) {
		transactions = await mangoClient.Cards.getTransactions(cardId, {
			parameters: { Page: numberOfPages },
		});
	} else {
		transactions = firstPageResponse.body;
	}
	return transactions.find(({ Id }) => Id === transactionId.toString());
}

export async function getLatestTransactionForWallet(
	walletId: string,
	{
		useSandbox = false,
		filterByTypes,
	}: { useSandbox?: boolean; filterByTypes?: string[] }
) {
	const mangoClient = Mango.getDefaultClient({ useSandbox });
	const firstPageResponse = await mangoClient.Wallets.getTransactions(
		walletId,
		{
			resolveWithFullResponse: true,
			parameters: {
				...(filterByTypes &&
					filterByTypes.length > 0 && {
						Type: filterByTypes.join(','),
					}),
			},
		}
	);
	const numberOfPages = Number(
		firstPageResponse.headers['x-number-of-pages'] ?? 1
	);
	let transactions;
	if (numberOfPages > 1) {
		transactions = await mangoClient.Wallets.getTransactions(walletId, {
			parameters: {
				Page: numberOfPages,
				...(filterByTypes &&
					filterByTypes.length > 0 && {
						Type: filterByTypes.join(','),
					}),
			},
		});
	} else {
		transactions = firstPageResponse.body;
	}
	return transactions[transactions.length - 1];
}

export async function transferFreeCredits(
	toUser: SchemaTypes.User,
	amountEur = 10,
	tag?: string,
	resourceId?: string,
	allowDuplicates: boolean = false
): Promise<SchemaTypes.Payment | null> {
	const useSandbox = Boolean(toUser.settings?.paymentSandbox);
	const { mangopayCreditsWalletId: destinationWalletId } =
		await getSystemUser('OWNER', {
			useSandbox,
		});
	if (!destinationWalletId) {
		throw new Error('Recipient has no wallet');
	}
	const propcoUser = await getSellerUser();
	const amount = new Decimal(amountEur);
	const existingPayment = await findFreeCreditsPayment(
		toUser.id,
		tag,
		resourceId ?? toUser.id
	);
	if (existingPayment && !allowDuplicates) {
		if (existingPayment.status === 'paid') {
			// We log those payments so we can troubleshoot.
			// Users cannot have multiple free credits payments with the
			// same { tag, userId, resourceId }
			// our data model allows it though if we allow a delay for instance (1h?)
			console.error('Payment already processed', existingPayment);
			throw new Error('Payment already processed');
		}
		// if payment is pending and at least 30s old, reprocess now.
		if (
			existingPayment.status === 'pending' &&
			existingPayment.createdAt.getTime() < Date.now() - 30 * 1000 &&
			existingPayment.transferId
		) {
			const transfer = await getTransfer(
				toUser,
				existingPayment.transferId
			);
			if (!transfer) {
				await prisma.payment.update({
					where: {
						id: existingPayment.id,
					},
					data: {
						status: 'errored',
					},
				});
				// Don't return so we can retry the transfer now
			} else {
				return await processPendingPayment(transfer, {
					useSandbox,
				});
			}
		} else {
			// existing payment is too recent, it might still be pending
			throw new Error('Payment already being processed');
		}
	}
	const transfer = await executeTransfer(
		propcoUser,
		{
			toWalletId: destinationWalletId,
			amountInCent: decimalToMangopayMoney(amount),
		},
		undefined,
		tag,
		toUser.settings,
		'OWNER'
	);
	const paymentData: Prisma.PaymentUncheckedCreateInput = {
		fromUserId: propcoUser.id,
		toUserId: toUser.id,
		amount: amountEur,
		transferId: transfer.Id,
		transferStatus: transfer.Status,
		status: 'pending',
		fundsSource: SchemaTypes.FundsSourceType.FREE_CREDITS,
		resourceId: resourceId ?? toUser.id,
		tag,
	};
	const payment = await transactionWithRetry(async (tx) => {
		await initiateCreditTransfer(propcoUser.id, toUser.id, amount, tx);

		if (existingPayment) {
			return await tx.payment.update({
				where: {
					id: existingPayment.id,
				},
				data: paymentData,
			});
		}
		return await tx.payment.create({
			data: paymentData,
		});
	});

	const processedPayment = await processPendingPayment(transfer, {
		useSandbox,
	});

	return processedPayment ?? payment;
}

export async function findFreeCreditsPayment(
	toUserId: string,
	tag?: string,
	resourceId?: string,
	tx?: PrismaClient
) {
	const propcoUser = await getSellerUser();
	return await (tx ?? prisma).payment.findFirst({
		where: {
			fromUserId: propcoUser.id,
			toUserId,
			status: {
				not: 'errored',
			},
			fundsSource: SchemaTypes.FundsSourceType.FREE_CREDITS,
			...(resourceId && { resourceId }),
			...(tag && { tag }),
		},
	});
}

export async function payoutProject(
	projectId: string,
	noFees: boolean = false
): Promise<Mangopay.payOut.PayOutData> {
	const project = await prisma.project.findUniqueOrThrow({
		where: { id: projectId },
		include: {
			owner: {
				include: {
					company: true,
				},
			},
			crowdfundingState: true,
		},
	});
	if (getProjectPercent(project) < 100) {
		throw new Error('Project is not completed.');
	}
	if (!project.owner) {
		throw new Error('Project has no owner.');
	}
	const destinationBankAccountId =
		project.owner.company?.mangopayBankAccountId;
	if (!destinationBankAccountId) {
		throw new Error('Project owner bank account missing.');
	}
	const bankWireRef = `PR ${project.tokenSymbol}`.substring(0, 12);
	console.log(
		`Payout "${bankWireRef}" to bank account ${destinationBankAccountId}...`
	);
	const { mangoClient, useSandbox } = getPaymentContextForUser(project.owner);
	const projectWalletId = useSandbox
		? project.sandboxMangopayWalletId
		: project.mangopayWalletId;
	if (!projectWalletId) {
		throw new Error('Project has no wallet');
	}
	const projectWallet = await mangoClient.Wallets.get(projectWalletId);
	if (projectWallet.Balance.Amount === 0) {
		throw new Error('Project wallet is empty');
	}
	// TODO NEXT: substract orders with fundsSource: 'DIVERSIFIED' to get the real collected amount
	const diversifiedCollectedAmount = await prisma.order.aggregate({
		where: {
			projectId,
			fundsSource: 'DIVERSIFIED',
			status: 'processed',
			type: 'BUY',
			executionType: 'INITIAL',
		},
		_sum: {
			amount: true,
		},
	});
	const realCollectedAmount =
		Number(project.crowdfundingState?.collectedAmount ?? 0) -
		Number(diversifiedCollectedAmount._sum?.amount ?? 0);
	let feesAmount = mangopayMoneyToDecimal(projectWallet.Balance.Amount).sub(
		realCollectedAmount
	);
	if (feesAmount.lt(0) || noFees) {
		feesAmount = new Decimal(0);
	}
	const systemOwner = await getSystemUser('OWNER', { useSandbox });
	const payoutData = {
		AuthorId: systemOwner.mangopayId,
		Tag: `Payout for project ${project.title}`,
		DebitedFunds: {
			Currency: 'EUR',
			Amount: projectWallet.Balance.Amount,
		},
		Fees: {
			Currency: 'EUR',
			Amount: decimalToMangopayMoney(feesAmount),
		},
		BankAccountId: destinationBankAccountId,
		DebitedWalletId: projectWalletId,
		PaymentType: 'BANK_WIRE',
		// PayoutModeRequested: 'INSTANT_PAYMENT',
		BankWireRef: bankWireRef,
	};
	console.log('Payout request data', payoutData);
	const payout = await mangoClient.PayOuts.create(payoutData);
	if (payout.Status === 'FAILED') {
		console.error('Payout failed', payout);
		throw new Error('Payout for project failed.');
	}
	await prisma.project.update({
		where: { id: project.id },
		data: {
			paid: true,
		},
	});
	// TODO NEXT: enable notifications once vars are supported in the client
	// await broadcastNotification({
	// 	type: 'marketing_general',
	// 	content: {
	// 		title: 'Asset 100% funded!',
	// 		description: '{{project}} is fully funded.',
	// 		vars: { project: project.title },
	// 	},
	// });
	return payout;
}

export async function findRecentTransferForOrder(
	order: SchemaTypes.Order,
	{ useSandbox = false }: { useSandbox?: boolean } = {}
): Promise<Mangopay.transfer.TransferData | null> {
	const systemUserOwner = await getSystemUser('OWNER', {
		useSandbox,
	});
	const user = await prisma.user.findUnique({ where: { id: order.userId } });
	if (!user) {
		return null;
	}
	const { mangopayWalletId } = getPaymentContextForUser(user, {
		paymentSandbox: useSandbox,
	});
	const debitedWalletId =
		order.fundsSource === FundsSourceType.FREE_CREDITS
			? systemUserOwner.mangopayCreditsWalletId
			: mangopayWalletId;
	if (!debitedWalletId) {
		return null;
	}
	const latestTransaction = await getLatestTransactionForWallet(
		debitedWalletId,
		{
			useSandbox,
			filterByTypes: ['TRANSFER'],
		}
	);
	// check if tx matches
	if (
		latestTransaction &&
		latestTransaction.Tag ===
			`Order ${order.id} for external user ${user.id}`
	) {
		// make sure the transaction is not already attributed to another order
		// for the same user
		const existingOrder = await prisma.order.findUnique({
			where: {
				paymentId: latestTransaction.Id,
			},
		});
		if (!existingOrder || existingOrder.id === order.id) {
			return latestTransaction as Mangopay.transfer.TransferData;
		}
	}
	return null;
}
