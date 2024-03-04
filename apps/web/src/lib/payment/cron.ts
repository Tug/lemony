import prisma, {
	Decimal,
	OrderForProject,
	orderForProjectIncludes,
	Prisma,
	SchemaTypes,
	transactionWithRetry,
	userWithCompanyIncludes,
	UserWithWallets,
	userWithWalletsIncludes,
} from '../prismadb';
import { Mango } from './client';
import { sendEmailToUserWithTemplate } from '../emails/sendgrid';
import { FundsSourceType, PrismaClient } from '@prisma/client';
import {
	getFirstUserOrdersAwaitingProcessing,
	getOrder,
	getOrderForProject,
	getOrdersByStatus,
	getPendingOrderWithPaymentId,
	getUserOrdersAwaitingProcessing,
	updateOrder,
} from '../checkout/order';
import { FreeCreditsBenefit, getBenefitByName } from '../benefits';
import { printMoney } from '@diversifiedfinance/app/lib/money';
import { DEFAULT_TOKEN_DECIMALS } from '@diversifiedfinance/app/lib/constants';
import Mangopay from 'mangopay2-nodejs-sdk';
import { confirmCreditTransfer, undoCreditTransfer } from './credits';
import { addUserLabel, addUserXP, getAnonymizedName } from '../user';
import { getUser } from '../auth';
import axios from 'axios';
import crypto from 'crypto';
import { TemplateHandler } from 'easy-template-x';
import path from 'path';
import { dbAddressToOneLiner, getNetAmountAndFeesV101 } from './utils';
import { getI18nServerInstance } from '../i18n';
import { syncAmplitudePurchase } from '../sync/amplitude';
import {
	difiedNumber,
	eurNumber,
} from '@diversifiedfinance/app/components/checkout/currency-utils';
import { getProject } from '../project';

// importing app/lib/mangopay imports axios which currently imports
// `access-token.ts` (instead of access-token.web.ts)
// which depends on mmkv and thus react native
// TODO: fix this
export function fromMangopayMoney(amountInCent: number = 0): number {
	return amountInCent / 100;
}
export function printMangopayMoney(amountInCent: number = 0): string {
	return printMoney(fromMangopayMoney(amountInCent));
}

// This is called every 10s by apps/serverless-polling
// Processing max 1000 events at a time
// so max capacity is roughly 100 events/sec if we ignore concurrency
export const processMongopayEvents = async () => {
	const unprocessedEvents = await prisma.mangopayEvent.findMany({
		where: {
			processedAt: null,
			createdAt: { lt: new Date(Date.now() - 5 * 1000) }, // at least 5s old
		},
		take: 1000,
	});
	// TODO: try to do it concurrently (e.g. Promise.allSettled)
	for (const event of unprocessedEvents) {
		try {
			await processMongopayEvent(event);
			await prisma.mangopayEvent.update({
				where: { id: event.id },
				data: {
					processedAt: new Date(),
				},
			});
		} catch (err) {
			if (__DEV__) {
				console.error(err);
			}
		}
	}
};

export const processOrders = async () => {
	// TODO: cache file download (for email attachments) to increase `take` here
	//  We have to keep the job time under 1 min
	const orders = await getFirstUserOrdersAwaitingProcessing({
		take: 5,
		useSandbox: false,
	});
	for (const order of orders) {
		await processOrder(order, {
			useSandbox: false,
		});
	}
	const sandboxOrders = await getFirstUserOrdersAwaitingProcessing({
		take: 5,
		useSandbox: true,
	});
	for (const order of sandboxOrders) {
		await processOrder(order, { useSandbox: true });
	}
};

export const processPresaleOrders = async () => {
	const prepaidOrders = await getOrdersByStatus('prepaid', {
		useSandbox: false,
	});
	for (const order of prepaidOrders) {
		await processPresaleOrder(order, { useSandbox: false });
	}
	const sandboxPrepaidOrders = await getOrdersByStatus('prepaid', {
		useSandbox: true,
	});
	for (const order of sandboxPrepaidOrders) {
		await processPresaleOrder(order, { useSandbox: true });
	}
};

export const processMongopayEvent = async (
	event: SchemaTypes.MangopayEvent
) => {
	if (
		event.eventType === 'PAYIN_NORMAL_SUCCEEDED' ||
		event.eventType === 'PAYIN_NORMAL_FAILED'
	) {
		return await processPayin(event.resourceId);
	}
	if (
		event.eventType === 'TRANSFER_NORMAL_SUCCEEDED' ||
		event.eventType === 'TRANSFER_NORMAL_FAILED'
	) {
		return await processTransfer(event.resourceId);
	}

	// all un-handled events are marked as processed at the moment
};

const processPayin = async (payinId: string) => {
	// TODO NEXT: this returns the sandbox client from time to time, need to investigate
	// See if this issue still happens: https://diversified.sentry.io/issues/4494126320/?project=4504536168202240&query=is%3Aunresolved&referrer=issue-stream&stream_index=4
	const mangoClient = Mango.getDefaultClient({ useSandbox: false });
	const payin = await mangoClient.PayIns.get(payinId);
	if (payin.PaymentType !== 'BANK_WIRE') {
		return;
	}
	if (payin.Status === 'FAILED') {
		// TODO: send email on SEPA failure
		return;
	}
	const user = await prisma.user.findUniqueOrThrow({
		where: { mangopayWalletId: payin.CreditedWalletId },
		include: userWithWalletsIncludes,
	});
	await sendEmailToUserWithTemplate({
		user,
		template: 'ACCOUNT_CREDITED_SEPA',
		customVars: {
			payin_credited_funds_currency: payin.CreditedFunds.Currency,
			payin_credited_funds_amount: printMangopayMoney(
				payin.CreditedFunds.Amount
			),
			payin_fees_amount: printMangopayMoney(payin.Fees.Amount),
			payin_result_code: payin.ResultCode,
			payin_result_message: payin.ResultMessage,
			payin_execution_date: payin.ExecutionDate,
			payin_creation_date: payin.CreationDate,
		},
	});
};

export const processTransfer = async (
	transferId: string
): Promise<OrderForProject | SchemaTypes.Payment | null> => {
	let mangoClient,
		useSandbox = false,
		transfer: Mangopay.transfer.TransferData | undefined;
	try {
		mangoClient = Mango.getDefaultClient({ useSandbox });
		useSandbox = false;
		transfer = await mangoClient.Transfers.get(transferId);
	} catch (err) {
		// Mango.getDefaultClient() can throw in sandbox env
	}

	if (!transfer) {
		try {
			useSandbox = true;
			mangoClient = Mango.getDefaultClient({ useSandbox });
			transfer = await mangoClient.Transfers.get(transferId);
		} catch (err) {
			// Mango.getDefaultClient() can throw in sandbox env
		}
	}

	if (!transfer || transfer.Status === 'CREATED') {
		return null;
	}

	const orderCollection = useSandbox ? prisma.sandboxOrder : prisma.order;
	const existingOrder = await orderCollection.findUnique({
		where: { paymentId: transfer.Id },
		select: { status: true },
	});
	if (existingOrder) {
		if (existingOrder.status !== 'pending') {
			// already processed, exit early
			return null;
		}
		return await processPendingOrder(transfer, { useSandbox });
	}

	const pendingPayment = await prisma.payment.findUnique({
		where: { transferId: transfer.Id },
		select: { status: true },
	});
	if (pendingPayment) {
		if (pendingPayment.status !== 'pending') {
			// already processed, exit early
			return null;
		}
		return await processPendingPayment(transfer, { useSandbox });
	}
	return null;
};

export const processPendingOrder = async (
	transfer: Mangopay.transfer.TransferData,
	{ useSandbox = false }: { useSandbox?: boolean } = {}
): Promise<OrderForProject | null> => {
	if (transfer.Status === 'FAILED') {
		return await transactionWithRetry(async (tx) => {
			const order = await getPendingOrderWithPaymentId(
				transfer.Id,
				{ useSandbox },
				tx
			);
			if (!order) {
				return null;
			}
			// give credits back if order failed
			if (order.fundsSource === FundsSourceType.FREE_CREDITS) {
				await undoCreditTransfer(order.userId, order.amount, tx);
			}
			return await updateOrder(
				order.id,
				transfer,
				'errored',
				{ useSandbox },
				tx
			);
		});
	}

	if (transfer.Status === 'SUCCEEDED') {
		const updatedOrder = await transactionWithRetry(async (tx) => {
			const order = await getPendingOrderWithPaymentId(
				transfer.Id,
				{ useSandbox },
				tx
			);
			if (!order) {
				return null;
			}
			const project = await tx.project.findUniqueOrThrow({
				where: { id: order.projectId },
				select: {
					isPresale: true,
				},
			});
			return await updateOrder(
				order.id,
				transfer,
				project.isPresale ? 'prepaid' : 'paid',
				{ useSandbox },
				tx
			);
		});

		if (
			updatedOrder &&
			(updatedOrder.status === 'paid' ||
				updatedOrder.status === 'prepaid')
		) {
			await onOrderSuccess(updatedOrder);
		}

		return updatedOrder;
	}

	return null;
};

export const processPendingPayment = async (
	transfer: Mangopay.transfer.TransferData,
	{ useSandbox = false }: { useSandbox?: boolean } = {}
): Promise<SchemaTypes.Payment | null> => {
	if (transfer.Status === 'FAILED') {
		return await transactionWithRetry(async (tx) => {
			const payment = await tx.payment.findUnique({
				where: { transferId: transfer.Id, status: 'pending' },
			});
			if (!payment) {
				return null;
			}
			if (payment.fundsSource === FundsSourceType.FREE_CREDITS) {
				await undoCreditTransfer(
					payment.fromUserId,
					payment.amount,
					tx
				);
			}
			return await tx.payment.update({
				where: { transferId: transfer.Id, status: 'pending' },
				data: {
					transferStatus: transfer.Status,
					status: 'errored',
				},
			});
		});
	}

	if (transfer.Status === 'SUCCEEDED') {
		const paymentOut = await transactionWithRetry(async (tx) => {
			const payment = await tx.payment.findUnique({
				where: { transferId: transfer.Id, status: 'pending' },
			});
			if (!payment) {
				throw new Error(
					'Could not find local payment information for transfer'
				);
			}
			if (payment.fundsSource === FundsSourceType.FREE_CREDITS) {
				await confirmCreditTransfer(
					payment.toUserId,
					payment.amount,
					tx
				);
				const benefit = getBenefitByName(payment?.tag ?? undefined);
				if (benefit && payment.resourceId && benefit.onApplied) {
					await benefit.onApplied(payment.resourceId, tx);
				}
			}
			return await tx.payment.update({
				where: { id: payment.id },
				data: {
					transferStatus: transfer.Status,
					status: 'paid',
				},
			});
		});
		// post transaction operations:
		// - send email notification for free credits transfer
		if (paymentOut.fundsSource === FundsSourceType.FREE_CREDITS) {
			const benefit = getBenefitByName(
				paymentOut.tag ?? undefined
			) as FreeCreditsBenefit;
			// TODO NEXT: warning this is prone to error, add a type to benefit instead
			if (!benefit || !benefit.name.includes('referral')) {
				return paymentOut;
			}
			const template =
				paymentOut.resourceId !== paymentOut.toUserId
					? 'FREE_CREDITS_RECEIVED_SPONSOR'
					: 'FREE_CREDITS_RECEIVED_REFERRAL';
			const receiver = await getUser(paymentOut.toUserId);
			const resourceUserName =
				paymentOut.resourceId !== paymentOut.toUserId
					? await getAnonymizedName(paymentOut.resourceId, {
							lastNameInitial: false,
					  })
					: await getAnonymizedName(receiver.referrerId, {
							lastNameInitial: true,
							companyName: true,
					  });
			await sendEmailToUserWithTemplate({
				template,
				user: receiver,
				customVars: {
					amount: printMoney(benefit.amountEur, 'EUR', {
						language: receiver.locale ?? 'en',
					}),
					credits_amount: printMoney(receiver.creditsEur, 'EUR', {
						language: receiver.locale ?? 'en',
					}),
					anonymized_name: resourceUserName,
				},
			});
		}
		return paymentOut;
	}

	return null;
};

async function onOrderSuccess(
	orderId: OrderForProject | string,
	{ useSandbox = false }: { useSandbox?: boolean } = {},
	tx?: PrismaClient
) {
	const order =
		typeof orderId === 'string'
			? await getOrderForProject(orderId, { useSandbox }, tx)
			: orderId;
	if (!order) {
		return;
	}
	await addUserLabel({ id: order.userId }, 'customer', tx);
	const tokenQuantity =
		Number(order.quantityInDecimal) /
		Math.pow(10, order.project.tokenDecimals ?? DEFAULT_TOKEN_DECIMALS);
	await addUserXP({ id: order.userId }, 100 * tokenQuantity, tx);
	if (!useSandbox) {
		await syncAmplitudePurchase(order);
	}
}

export async function processOrder(
	orderId: string | SchemaTypes.Order | SchemaTypes.SandboxOrder,
	{ useSandbox = false }: { useSandbox?: boolean } = {}
) {
	const order: SchemaTypes.Order =
		typeof orderId === 'string'
			? await getOrder(orderId, { useSandbox })
			: orderId;
	// order should be at least 1 min old to be processed.
	if (order.createdAt > new Date(Date.now() - 60 * 1000)) {
		return;
	}
	const user = await getUser(order.userId);
	// group all pending paid orders for this user
	const orders = await getUserOrdersAwaitingProcessing(order.userId, {
		useSandbox,
		orderInclude: orderForProjectIncludes,
	});
	const { filename, content, type } = await generateOrdersInvoice(
		user,
		orders,
		{
			useSandbox,
			downloadContent: true,
		}
	);
	const i18n = await getI18nServerInstance(user.locale);
	const kidUrl = i18n.t(
		'https://getdiversified.app/wp-content/uploads/2023/11/KID_ST_EN_05112023.pdf'
	);
	const kidAttachment = {
		content: await downloadDocument(kidUrl),
		filename: decodeURIComponent(path.basename(kidUrl)),
		type: 'application/pdf',
		disposition: 'attachment',
	};
	const tcs = orders.map((o) => i18n.t(o.project.documentUrl));
	const tcsUrls = Array.from(new Set(tcs));
	const tcsAttachments = await Promise.all(
		tcsUrls.map(async (url) => ({
			content: await downloadDocument(url),
			filename: decodeURIComponent(path.basename(url)),
			type: 'application/pdf',
			disposition: 'attachment',
		}))
	);
	await sendEmailToUserWithTemplate({
		template: 'ORDER_SUCCESS',
		user,
		customVars: {
			useSandbox,
		},
		attachments: [
			{
				content,
				filename,
				type,
				disposition: 'attachment',
			},
			kidAttachment,
			...tcsAttachments,
		],
	});
	const orderCollection = useSandbox ? prisma.sandboxOrder : prisma.order;
	await orderCollection.updateMany({
		where: { id: { in: orders.map(({ id }) => id) } },
		data: {
			status: 'processed',
		},
	});
}

const downloadDocument = async (url, encoding = 'base64') => {
	const response = await axios.get(url, {
		responseType: 'arraybuffer',
		headers: {
			Accept: 'application/pdf',
		},
	});
	if (encoding) {
		return response.data.toString(encoding);
	}
	return response.data;
};

export const ordersTemplates = {
	en: 'https://getdiversified.app/wp-content/uploads/2023/07/Invoice-template-en.docx',
	fr: 'https://getdiversified.app/wp-content/uploads/2023/07/Invoice-template-fr.docx',
};

export async function generateOrdersInvoice(
	user: UserWithWallets,
	orders: OrderForProject[],
	{
		useSandbox = false,
		downloadContent = false,
	}: { useSandbox?: boolean; downloadContent?: boolean } = {}
): Promise<{
	content: string;
	filename: string;
	type: string;
	url: string;
}> {
	if (!orders || orders.length === 0) {
		throw new Error('Cannot generate invoice for an empty list of orders');
	}
	const templateUrl = ordersTemplates[user.locale] ?? ordersTemplates.en;
	const i18n = await getI18nServerInstance(user.locale);
	const document = await axios.get(templateUrl, {
		responseType: 'arraybuffer',
		headers: {
			Accept: 'application/pdf',
		},
	});
	const ordersData = orders.map((order) => {
		const quantity = difiedNumber(
			new Decimal(order.quantityInDecimal.toString()).div(
				new Decimal(10).pow(order.project.tokenDecimals)
			)
		);
		const unitPrice = order.project.tokenPrice.toNumber();
		const total = eurNumber(quantity * unitPrice);
		const unitPriceStr = printMoney(unitPrice, 'EUR', i18n);
		return {
			itemDescription: order.project.tokenName,
			quantity: new Intl.NumberFormat(i18n.language, {
				minimumFractionDigits: 0,
				maximumFractionDigits: order.project.tokenDecimals,
			}).format(quantity),
			unitPrice: unitPriceStr,
			itemTotal: printMoney(total, 'EUR', i18n),
			itemTotalNumber: total,
			itemTotalPaid: printMoney(eurNumber(order.amount), 'EUR', i18n),
			itemDate: order.project.crowdfundingStartsAt,
			date: new Intl.DateTimeFormat(i18n.language).format(
				order.createdAt
			),
			itemVat: new Intl.NumberFormat(i18n.language, {
				style: 'percent',
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}).format(0),
		};
	});
	const total = ordersData.reduce<number>(
		(acc, { itemTotalNumber }) => eurNumber(acc + itemTotalNumber),
		0
	);
	const templateData = {
		date: new Intl.DateTimeFormat(i18n.language).format(new Date()),
		userName: `${user.firstName} ${user.lastName}`.trim(),
		userAddress: dbAddressToOneLiner(user.address, true),
		userEmailOrPhone: user.email ?? user.phoneNumber,
		orders: ordersData,
		subtotal: printMoney(total, 'EUR', i18n),
		taxRate: new Intl.NumberFormat(i18n.language, {
			style: 'percent',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(0),
		totalTax: printMoney(0, 'EUR', i18n),
		total: printMoney(total, 'EUR', i18n),
		lang: i18n.language,
	};
	const shortHash = crypto
		.createHash('sha1')
		.update(JSON.stringify(templateData))
		.digest('hex')
		.slice(0, 7);
	const docName = `Bond_Subscription_${shortHash}.pdf`;
	const templateHandler = new TemplateHandler();
	const outputDocBuffer = await templateHandler.process(
		document.data,
		templateData
	);
	const response = await axios.post(
		'https://hfltu6zgfiz7bqyphwbp4sfove0jixsb.lambda-url.eu-west-3.on.aws/convert',
		{
			filename: decodeURIComponent(path.basename(templateUrl)),
			encoding: 'base64',
			data: Buffer.from(outputDocBuffer).toString('base64'),
			dstKey: docName,
		}
	);
	const orderCollection = useSandbox ? prisma.sandboxOrder : prisma.order;
	await orderCollection.updateMany({
		where: { id: { in: orders.map(({ id }) => id) } },
		data: {
			invoiceUrl: response.data.url,
		},
	});
	const content = downloadContent
		? await downloadDocument(response.data.url)
		: null;
	return {
		content,
		url: response.data.url,
		filename: docName,
		type: 'application/pdf',
	};
}

export async function processPresaleOrder(
	orderId: string | SchemaTypes.Order | SchemaTypes.SandboxOrder,
	{ useSandbox = false }: { useSandbox?: boolean } = {}
) {
	const order: SchemaTypes.Order =
		typeof orderId === 'string'
			? await getOrder(orderId, { useSandbox })
			: orderId;
	// order should be at least 1 min old to be processed.
	if (order.createdAt > new Date(Date.now() - 60 * 1000)) {
		return;
	}
	const project = await getProject({ slug: order.projectId });
	if (order.status === 'preprocessed') {
		// only convert from `preprocessed` to `processed`
		// if project is not in presale anymore
		if (!project.isPresale) {
			await processOrder(order, { useSandbox });
		}
		return;
	}
	const user = await getUser(order.userId);
	const { netAmount } = getNetAmountAndFeesV101(order.amount, project);
	const i18n = await getI18nServerInstance(user.locale ?? undefined);
	// TODO: send confirmation email
	await sendEmailToUserWithTemplate({
		template: 'PREORDER_SUCCESS',
		user,
		customVars: {
			useSandbox,
			order_id: order.id,
			project_name: project.tokenName,
			net_amount: eurNumber(netAmount),
			gross_amount: eurNumber(order.amount),
			net_amount_str: printMoney(eurNumber(netAmount), 'EUR', i18n),
			gross_amount_str: printMoney(eurNumber(order.amount), 'EUR', i18n),
			presale_start: new Intl.DateTimeFormat(i18n.language).format(
				project.crowdfundingStartsAt
			),
			presale_end: new Intl.DateTimeFormat(i18n.language).format(
				project.crowdfundingEndsAt
			),
		},
	});
	const orderCollection = useSandbox ? prisma.sandboxOrder : prisma.order;
	await orderCollection.update({
		where: { id: order.id },
		data: {
			status: 'preprocessed',
		},
	});
}
