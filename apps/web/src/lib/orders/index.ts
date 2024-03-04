import prisma, {
	Prisma,
	SchemaTypes,
	OrderForProject,
	orderForProjectIncludes,
} from '../prismadb';
import { getPricesForProjectV2 } from '../price';
import { getPaymentContextForUser } from '../payment/client';
import { OrderOfProject } from '@diversifiedfinance/types/diversified';
import { toPublicProject } from '../project/utils';
import type { Order as PublicOrder } from '@diversifiedfinance/types/diversified';

export const toPublicOrder = (order: SchemaTypes.Order): PublicOrder => ({
	...order,
	status:
		order.status === 'preprocessed' || order.status === 'pendingRefund'
			? 'prepaid'
			: order.status,
	amount: order.amount.toNumber(),
	// TODO: handle BigInt quantityInDecimal on the client
	quantityInDecimal: Number(order.quantityInDecimal),
	...(order.project && { project: toPublicProject(order.project) }),
});

const groupOrders = (orders: OrderForProject[]) => {
	return Object.values(
		orders.reduce((result, order) => {
			// App v15 does not support 'preprocessed' status, fallback to 'prepaid'
			const status =
				order.status === 'preprocessed' ||
				order.status === 'pendingRefund'
					? 'prepaid'
					: order.status;
			const groupingKey = `${order.projectId}-${status}`;
			if (!result[groupingKey]) {
				result[groupingKey] = order;
			} else if (order.type === 'BUY') {
				result[groupingKey].amount = result[groupingKey].amount.add(
					order.amount
				);
				result[groupingKey].quantityInDecimal +=
					order.quantityInDecimal;
			} else if (order.type === 'SELL') {
				result[groupingKey].amount = result[groupingKey].amount.sub(
					order.amount
				);
				result[groupingKey].quantityInDecimal -=
					order.quantityInDecimal;
			}
			return result;
		}, {} as { [projectId: string]: OrderForProject })
	);
};

export async function getUserOrders(
	userId: string,
	customIncludes?: any
): Promise<OrderForProject[]> {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
	});
	const { useSandbox } = getPaymentContextForUser(user);
	const orderCollection = useSandbox ? prisma.sandboxOrder : prisma.order;
	return groupOrders(
		await orderCollection.findMany({
			where: {
				userId,
				status: {
					in: [
						'paid',
						'prepaid',
						'processed',
						'preprocessed',
						'pendingRefund',
					],
				},
			},
			include: customIncludes ?? orderForProjectIncludes,
		})
	);
}

export async function getUserTokensForProject(
	userId: string,
	projectId: string,
	{ useSandbox = false }: { useSandbox?: boolean } = {},
	tx: Prisma.TransactionClient = prisma
): Promise<SchemaTypes.Order | null> {
	const orders = await tx.$queryRawUnsafe(
		`
		SELECT
		  "userId",
		  "projectId",
		  SUM(CASE WHEN type = 'BUY' THEN amount ELSE -amount END) AS amount,
		  SUM(CASE WHEN type = 'BUY' THEN "quantityInDecimal" ELSE -"quantityInDecimal" END) AS "quantityInDecimal"
		FROM
		  ${useSandbox ? 'sandbox.orders' : 'public.orders'}
		WHERE
		  "userId" = ? AND "projectId" = ? AND status IN ('paid', 'prepaid', 'processed', 'preprocessed', 'pendingRefund')
		GROUP BY
		  "projectId", "userId";
	`,
		userId,
		projectId
	);
	if (!orders || orders.length === 0) {
		return null;
	}
	return {
		userId: orders[0].userId,
		projectId: orders[0].projectId,
		amount: orders[0].amount,
		quantityInDecimal: orders[0].quantityInDecimal,
		currency: 'EUR',
	};
}

export async function getUserOrdersWithPrices(
	userId: string
): Promise<OrderOfProject[]> {
	const orders: OrderForProject[] = await getUserOrders(userId);
	return await Promise.all(
		orders.map(async (order) => ({
			...toPublicOrder(order),
			project: {
				...toPublicProject(order.project),
				prices: await getPricesForProjectV2(order.projectId),
			},
		}))
	);
}
