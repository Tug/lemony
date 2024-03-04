import prisma, { SchemaTypes, Prisma } from '../prismadb';
import { Decimal } from 'decimal.js';
import { eurNumber } from '@diversifiedfinance/app/components/checkout/currency-utils';
const AVG_SELL_AMOUNT_EUR = 20; // TODO: update this
const MAX_SELL_ORDERS = 30;
const MIN_SELL_ORDERS = 1;

export async function processNextBuyOrder({
	useSandbox = false,
}: { useSandbox?: boolean } = {}) {
	const orderCollection = useSandbox ? prisma.sandboxOrder : prisma.order;
	const buyOrder = await orderCollection.findMany({
		where: {
			type: 'BUY',
			status: 'pending',
		},
		orderBy: { createdAt: 'asc' },
		take: 1,
	});
	await processBuyOrder(buyOrder, { useSandbox });
}

async function getMatchingSellOrdersLimit(
	buyOrder: SchemaTypes.Order,
	{
		allOrNone = true,
		useSandbox = false,
	}: { allOrNone?: boolean; useSandbox?: boolean } = {}
): Promise<SchemaTypes.Order[]> {
	const orderCollection = useSandbox ? prisma.sandboxOrder : prisma.order;
	let matchingSellOrders: SchemaTypes.Order[];
	if (allOrNone) {
		matchingSellOrders = await prisma.$queryRawUnsafe(
			`
			WITH ordered_sell_orders AS (
			  SELECT
				*,
				SUM("quantityInDecimal") OVER (ORDER BY "createdAt" ASC) AS "runningTotal"
			  FROM ${useSandbox ? 'sandbox.orders' : 'public.orders'}
			  WHERE
				type = 'SELL'
				AND status = 'pending'
				AND "projectId" = $1
			),
			cumulative_sell_orders AS (
			  SELECT
				*,
				MIN(id) OVER (ORDER BY "runningTotal" DESC) AS "cutoffId"
			  FROM ordered_sell_orders
			)
			SELECT
			  *
			FROM cumulative_sell_orders
			WHERE
			  "cutoffId" = id
			  AND "runningTotal" >= $2
	  `,
			buyOrder.projectId,
			buyOrder.quantityInDecimal
		);
	} else {
		const estimatedRequiredSellOrdersCount = Math.min(
			MAX_SELL_ORDERS,
			Math.max(
				MIN_SELL_ORDERS,
				Math.round(buyOrder.amount.toNumber() / AVG_SELL_AMOUNT_EUR)
			)
		);
		const take = estimatedRequiredSellOrdersCount + 1;
		matchingSellOrders = await orderCollection.findMany({
			where: {
				projectId: buyOrder.projectId,
				// TODO: implement LIMIT and MARKET execution types
				// executionType: buyOrder.executionType,
				status: 'pending',
				type: 'SELL',
			},
			take,
		});
	}
	return matchingSellOrders;
}

export async function processBuyOrder(
	buyOrder: SchemaTypes.Order,
	{
		allOrNone = false,
		useSandbox = false,
	}: { allOrNone?: boolean; useSandbox?: boolean } = {}
) {
	const orderCollection = useSandbox ? prisma.sandboxOrder : prisma.order;
	const matchingSellOrders = await getMatchingSellOrdersLimit(buyOrder, {
		allOrNone,
		useSandbox,
	});
	if (matchingSellOrders.length === 0) {
		if (__DEV__) {
			console.log('Failed to find matching sell orders', buyOrder);
		}
		return;
	}
	// TODO: in a single transaction, using optimistic concurrency control,
	//  match the BUY order with all the SELL orders
	if (allOrNone) {
		throw new Error('Not implemented');
		// await matchOrdersAllOrNone(buyOrder, matchingSellOrders, { useSandbox });
	}
	let buyOrderUpdated = buyOrder;
	for (const sellOrder of matchingSellOrders) {
		try {
			await match2Orders(buyOrderUpdated, sellOrder, { useSandbox });
		} catch (err) {
			if (__DEV__) {
				console.log('Failed to match orders', buyOrder, sellOrder, err);
			}
		}
		buyOrderUpdated = await orderCollection.findUnique({
			where: {
				id: buyOrder.id,
			},
		});
		if (buyOrderUpdated.status !== 'pending') {
			break;
		}
	}
	return buyOrderUpdated;
}

function getCopyableOrderData(order: SchemaTypes.Order) {
	return {
		projectId: order.projectId,
		userId: order.userId,
		type: order.type,
		fundsSource: order.fundsSource,
		executionType: order.executionType,
	};
}

export async function closeOrder(
	order: Pick<SchemaTypes.Order, 'id'>,
	{ useSandbox }: { useSandbox: boolean } = {},
	tx: Prisma.TransactionClient = prisma
) {
	const orderCollection = useSandbox ? tx.sandboxOrder : tx.order;
	// if order is fully sold out mark as processed
	// we could also remove it
	await orderCollection.update({
		where: {
			id: order.id,
			quantityInDecimal: 0,
			status: 'pending',
		},
		data: {
			status: 'processed',
		},
	});
}

// this method matches 1 BUY LIMIT order with 1 SELL LIMIT order
export async function match2Orders(
	buyOrder: SchemaTypes.Order,
	sellOrder: SchemaTypes.Order,
	{ useSandbox = false }: { useSandbox?: boolean } = {},
	tx: Prisma.TransactionClient = prisma
): Promise<void> {
	const orderCollection = useSandbox ? tx.sandboxOrder : tx.order;
	if (buyOrder.status !== 'pending' || sellOrder.status !== 'pending') {
		throw new Error('Cannot match non-pending orders');
	}
	if (buyOrder.projectId !== sellOrder.projectId) {
		throw new Error('Cannot match orders of different project');
	}
	if (buyOrder.quantityInDecimal === 0) {
		await closeOrder(buyOrder, { useSandbox }, tx);
		throw new Error('Buy order closed');
	}
	if (sellOrder.quantityInDecimal === 0) {
		await closeOrder(sellOrder, { useSandbox }, tx);
		throw new Error('Sell order closed');
	}
	if (buyOrder.executionType !== 'LIMIT') {
		throw new Error('Only BUY LIMIT orders are supported');
	}
	// TODO: mark sell orders as paid and generate receipts
	// BigInt comparison
	if (buyOrder.quantityInDecimal === sellOrder.quantityInDecimal) {
		await tx.$transaction([
			orderCollection.update({
				where: {
					id: sellOrder.id,
					version: sellOrder.version,
				},
				data: {
					status: 'processed',
					version: {
						increment: 1,
					},
				},
			}),
			orderCollection.update({
				where: {
					id: buyOrder.id,
					version: buyOrder.version,
				},
				data: {
					status: 'paid',
					version: {
						increment: 1,
					},
				},
			}),
		]);
		return;
	}
	if (buyOrder.quantityInDecimal > sellOrder.quantityInDecimal) {
		const amountForSellQuantity = buyOrder.amount
			.mul(Number(sellOrder.quantityInDecimal))
			.div(Number(buyOrder.quantityInDecimal));
		// if there is more to buy than available
		// In an atomic operation:
		//  - execute payment
		//  - close sell order
		//  - create matching paid buy order with the amount of the sell order
		//  - update original buy order (decrement by the amount)
		// TODO NEXT: process payment transfer here
		await tx.$transaction([
			// close sell order
			orderCollection.update({
				where: {
					id: sellOrder.id,
					version: sellOrder.version,
				},
				data: {
					status: 'processed',
					version: {
						increment: 1,
					},
				},
			}),
			// create matching paid buy order
			orderCollection.create({
				data: {
					...getCopyableOrderData(buyOrder),
					amount: amountForSellQuantity,
					quantityInDecimal: sellOrder.quantityInDecimal,
					// paid will generate a receipt before marking it processed
					status: 'paid',
				},
			}),
			// update original buy order
			orderCollection.update({
				where: {
					id: buyOrder.id,
					version: buyOrder.version,
				},
				data: {
					amount: {
						decrement: amountForSellQuantity,
					},
					quantityInDecimal: {
						decrement: sellOrder.quantityInDecimal,
					},
					version: {
						increment: 1,
					},
				},
			}),
		]);
		return;
	}
	if (buyOrder.quantityInDecimal < sellOrder.quantityInDecimal) {
		const amountForBuyQuantity = sellOrder.amount
			.mul(Number(buyOrder.quantityInDecimal))
			.div(Number(sellOrder.quantityInDecimal));
		// if there is more to sell than available
		// In an atomic operation:
		//  - execute payment
		//  - close buy order
		//  - create matching paid sell order with the amount of the buy order
		//  - update original sell order (decrement by the amount)
		// TODO NEXT: process payment transfer here
		await tx.$transaction([
			// close buy order
			orderCollection.update({
				where: {
					id: buyOrder.id,
					version: buyOrder.version,
				},
				data: {
					status: 'paid',
					version: {
						increment: 1,
					},
				},
			}),
			// create matching paid sell order
			orderCollection.create({
				data: {
					...getCopyableOrderData(sellOrder),
					amount: amountForBuyQuantity,
					quantityInDecimal: buyOrder.quantityInDecimal,
					// TODO NEXT: handle paid status on SELL order and generate
					//  a document
					// status: 'paid',
					status: 'processed',
				},
			}),
			// update original sell order
			orderCollection.update({
				where: {
					id: sellOrder.id,
					version: sellOrder.version,
				},
				data: {
					amount: {
						decrement: amountForBuyQuantity,
					},
					quantityInDecimal: {
						decrement: buyOrder.quantityInDecimal,
					},
					version: {
						increment: 1,
					},
				},
			}),
		]);
	}
}

// TODO: Work in Progress, needs testing
export async function matchOrders(
	buyOrder: SchemaTypes.Order,
	sellOrders: SchemaTypes.Order[],
	{ useSandbox = false }: { useSandbox?: boolean } = {},
	tx: Prisma.TransactionClient = prisma
): Promise<void> {
	const totalSellQuantity = sellOrders.reduce((acc, sellOrder) => {
		return acc + sellOrder.quantityInDecimal;
	}, BigInt(0));
	const totalSellAmount = sellOrders.reduce((acc, sellOrder) => {
		return acc.add(sellOrder.amount);
	}, new Decimal(0));
	if (buyOrder.quantityInDecimal > totalSellQuantity) {
		throw new Error('Not enough sell orders to match the buy order');
	}
	if (buyOrder.quantityInDecimal === BigInt(0)) {
		await closeOrder(buyOrder, { useSandbox }, tx);
		throw new Error('Buy order closed');
	}
	if (buyOrder.executionType !== 'LIMIT') {
		throw new Error('Only BUY LIMIT orders are supported');
	}
	if (buyOrder.status !== 'pending') {
		throw new Error('Cannot match non-pending orders');
	}
	const orderCollection = useSandbox ? tx.sandboxOrder : tx.order;
	const [lastSellOrder, ...sellOrdersToClose] = sellOrders.reverse();
	const lastSellOrderSoldQuantity =
		totalSellQuantity - buyOrder.quantityInDecimal;
	const lastSellOrderSoldAmount = eurNumber(
		lastSellOrder.amount
			.mul(Number(lastSellOrderSoldQuantity))
			.div(Number(lastSellOrder.quantityInDecimal))
	);
	const newLastSellOrderQuantity =
		lastSellOrder.quantityInDecimal - lastSellOrderSoldQuantity;
	const newLastSellOrderAmount = lastSellOrder.amount.sub(
		lastSellOrderSoldAmount
	);
	if (newLastSellOrderQuantity > lastSellOrder.quantityInDecimal) {
		throw new Error('Inconsistent SELL order selection to match BUY order');
	}
	// In an atomic operation:
	//  - execute payment (TODO)
	//  - close buy order
	//  - close all sell orders except the last one
	//  - close the last sell order and update it with the purchased quantity and amount
	//  - create a new sell order with the remaining quantity from the last sell order
	// TODO NEXT: process payment transfer here
	await tx.$transaction([
		// close buy order
		orderCollection.update({
			where: {
				id: buyOrder.id,
				version: buyOrder.version,
			},
			data: {
				status: 'paid',
				version: {
					increment: 1,
				},
			},
		}),
		// update all matching sell order
		...sellOrdersToClose.map((sellOrder) =>
			orderCollection.update({
				where: {
					id: sellOrder.id,
					version: sellOrder.version,
				},
				data: {
					status: 'processed',
					version: {
						increment: 1,
					},
				},
			})
		),
		orderCollection.update({
			where: {
				id: lastSellOrder.id,
				version: lastSellOrder.version,
			},
			data: {
				quantityInDecimal: lastSellOrderSoldQuantity,
				amount: lastSellOrderSoldAmount,
				status: 'processed',
			},
		}),
		orderCollection.create({
			data: {
				...getCopyableOrderData(lastSellOrder),
				quantityInDecimal: newLastSellOrderQuantity,
				amount: newLastSellOrderAmount,
				status: lastSellOrder.status,
				version: {
					increment: 1,
				},
			},
		}),
	]);
}
