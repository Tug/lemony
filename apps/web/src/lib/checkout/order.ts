import prisma, {
	Decimal,
	OrderForProject,
	orderForProjectIncludes,
	Prisma,
	SchemaTypes,
} from '../prismadb';
import Mangopay from 'mangopay2-nodejs-sdk';
import {
	getNetAmountAndFeesV101,
	mangopayMoneyToDecimal,
} from '../payment/utils';
import { PrismaClient } from '@prisma/client';

export async function getOrder(
	orderId: string,
	{ useSandbox = false }: { useSandbox?: boolean } = {},
	tx?: PrismaClient
): Promise<SchemaTypes.Order | null> {
	const prismaClient = tx ?? prisma;
	const orderCollection = useSandbox
		? prismaClient.sandboxOrder
		: prismaClient.order;
	return await orderCollection.findUnique({
		where: {
			id: orderId,
		},
	});
}

export async function getPendingOrderWithPaymentId(
	paymentId: string,
	{ useSandbox = false }: { useSandbox?: boolean } = {},
	tx?: PrismaClient
): Promise<SchemaTypes.Order | null> {
	const prismaClient = tx ?? prisma;
	const orderCollection = useSandbox
		? prismaClient.sandboxOrder
		: prismaClient.order;
	return await orderCollection.findUnique({
		where: {
			paymentId,
			status: 'pending',
		},
	});
}

export async function getOrderForProject(
	orderId: string,
	{ useSandbox = false }: { useSandbox?: boolean } = {},
	tx?: PrismaClient
): Promise<OrderForProject | null> {
	const prismaClient = tx ?? prisma;
	const orderCollection = useSandbox
		? prismaClient.sandboxOrder
		: prismaClient.order;
	return await orderCollection.findUnique({
		where: {
			id: orderId,
		},
		include: orderForProjectIncludes,
	});
}

export async function getOrCreateOrder(
	orderData: Prisma.OrderUncheckedCreateInput,
	{
		useSandbox = false,
		include,
	}: { useSandbox?: boolean; include?: any } = {},
	tx: Prisma.TransactionClient = prisma
): Promise<SchemaTypes.Order> {
	const orderCollection = useSandbox ? tx.sandboxOrder : tx.order;
	return await orderCollection.upsert({
		where: {
			id: orderData.id || '-',
			...orderData,
		},
		create: {
			status: 'pending',
			...orderData,
		},
		update: {},
		include,
	});
}

export async function getTokenQuantityInDecimal(
	orderId: string,
	amount: Decimal,
	{ useSandbox = false }: { useSandbox?: boolean } = {},
	tx?: PrismaClient
) {
	const prismaClient = tx ?? prisma;
	const orderCollection = useSandbox
		? prismaClient.sandboxOrder
		: prismaClient.order;
	const order = await orderCollection.findUniqueOrThrow({
		where: { id: orderId },
		select: {
			project: {
				select: {
					tokenDecimals: true,
					tokenPrice: true,
					feesPercent: true,
				},
			},
		},
	});
	if (!order.project) {
		// TODO: double check if it's possible in the schema, if it is make it impossible
		throw new Error(
			'Order is attached to no project. This should not have happened'
		);
	}

	const { netAmount } = getNetAmountAndFeesV101(amount, order.project);

	return netAmount
		.mul(Math.pow(10, order.project.tokenDecimals))
		.dividedBy(order.project.tokenPrice)
		.round()
		.toNumber();
}

export async function updateOrder(
	orderId: string,
	transfer: Mangopay.transfer.TransferData,
	status?: SchemaTypes.OrderStatus,
	{ useSandbox = false }: { useSandbox?: boolean } = {},
	tx?: PrismaClient
): Promise<OrderForProject> {
	const prismaClient = tx ?? prisma;
	let orderStatus: SchemaTypes.OrderStatus | undefined = status;
	if (!orderStatus) {
		if (transfer.Status === 'SUCCEEDED') {
			orderStatus = 'paid';
		} else if (transfer.Status === 'FAILED') {
			orderStatus = 'errored';
		} else {
			orderStatus = 'pending';
		}
	}
	const orderCollection = useSandbox
		? prismaClient.sandboxOrder
		: prismaClient.order;
	return await orderCollection.update({
		where: { id: orderId },
		data: {
			// amount may have changed if allowLess was given on checkout
			amount: mangopayMoneyToDecimal(transfer.CreditedFunds.Amount),
			paymentId: transfer.Id,
			paymentStatus: transfer.Status,
			status: orderStatus,
			quantityInDecimal: await getTokenQuantityInDecimal(
				orderId,
				mangopayMoneyToDecimal(transfer.CreditedFunds.Amount),
				{
					useSandbox,
				},
				tx
			),
		},
		include: orderForProjectIncludes,
	});
}

export async function getUserOrdersAwaitingProcessing(
	userId: string,
	{
		useSandbox = false,
		orderInclude,
	}: {
		useSandbox?: boolean;
		orderInclude?: any;
	} = {},
	tx?: PrismaClient
) {
	const prismaClient = tx ?? prisma;
	const orderCollection = useSandbox
		? prismaClient.sandboxOrder
		: prismaClient.order;
	return await orderCollection.findMany({
		where: {
			userId,
			OR: [
				{
					status: 'paid',
				},
				{
					status: 'preprocessed',
					project: {
						isPresale: false,
					},
				},
			],
		},
		include: orderInclude,
	});
}

export async function getOrdersByStatus(
	status: string | string[],
	{
		useSandbox = false,
		orderInclude,
	}: {
		useSandbox?: boolean;
		orderInclude?: any;
	} = {},
	tx?: PrismaClient
) {
	const prismaClient = tx ?? prisma;
	const orderCollection = useSandbox
		? prismaClient.sandboxOrder
		: prismaClient.order;
	return await orderCollection.findMany({
		where: {
			status: Array.isArray(status) ? { in: status } : status,
		},
		include: orderInclude,
	});
}

export async function getFirstUserOrdersAwaitingProcessing(
	{
		take = 100,
		cursor,
		useSandbox = false,
		orderInclude,
	}: {
		take?: number;
		cursor?: string;
		useSandbox?: boolean;
		orderInclude?: any;
	} = {},
	tx?: PrismaClient
) {
	const prismaClient = tx ?? prisma;
	const orderCollection = useSandbox
		? prismaClient.sandboxOrder
		: prismaClient.order;
	return await orderCollection.findMany({
		where: {
			OR: [
				{
					status: 'paid',
				},
				{
					status: 'preprocessed',
					project: {
						isPresale: false,
					},
				},
			],
		},
		distinct: ['userId'],
		orderBy: {
			createdAt: 'asc',
		},
		take,
		...(cursor && { cursor }),
		include: orderInclude,
	});
}
