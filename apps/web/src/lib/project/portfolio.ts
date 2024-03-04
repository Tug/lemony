import {
	Decimal,
	ProjectWithProductIds,
	projectWithProductIdsIncludes,
} from '../prismadb';
import { getUserOrders } from '../orders';

export async function getPortfolioProjectsWithProductIds(
	userId: string
): Promise<ProjectWithProductIds[]> {
	const orders = await getUserOrders(userId, {
		project: { include: projectWithProductIdsIncludes },
	});
	return orders.map((order) => ({
		...order.project,
		products: order.project.products.map(
			({ projectId, productId, quantity }) => ({
				projectId,
				productId,
				quantity: order.project.tokenPrice
					.mul(order.quantityInDecimal.toString())
					.mul(quantity)
					.div(order.project.targetPrice)
					.div(new Decimal(10).pow(order.project.tokenDecimals))
					.toNumber(),
			})
		),
	}));
}

export async function getPortfolioPrices(
	userId: string
): Promise<ProjectWithProductIds[]> {
	const orders = await getUserOrders(userId, {
		project: { include: projectWithProductIdsIncludes },
	});
	return orders.map((order) => ({
		...order.project,
		products: order.project.products.map(
			({ projectId, productId, quantity }) => ({
				projectId,
				productId,
				quantity: order.project.tokenPrice
					.mul(order.quantityInDecimal.toString())
					.mul(quantity)
					.div(order.project.targetPrice)
					.div(new Decimal(10).pow(order.project.tokenDecimals))
					.toNumber(),
			})
		),
	}));
}
