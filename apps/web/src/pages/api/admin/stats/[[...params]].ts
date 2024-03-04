import prisma from '../../../../lib/prismadb';
import type { NextApiRequest } from 'next';
import { Catch, createHandler, Get, Req, SetHeader } from 'next-api-decorators';
import RequiresAuth, {
	RequiresAdminAuth,
} from '../../../../helpers/api/requires-auth';
import { exceptionHandler } from '../../../../lib/error';
import {
	getAllDisputes,
	getMangopayStats,
	getProjectWalletsStats,
} from '../../../../lib/payment/stats';

@RequiresAuth()
@RequiresAdminAuth()
@Catch(exceptionHandler)
class AdminStatsHandler {
	// GET /api/admin/stats
	@Get('/')
	@SetHeader('Cache-Control', 'nostore')
	public async list(@Req() req: NextApiRequest): Promise<any> {
		const totalUsersStatsRes = await prisma.$queryRaw`
			SELECT
				COUNT(u.*) AS total_users_count
			FROM public.users u
		`;
		const kycUsersStatsRes = await prisma.$queryRaw`
			SELECT
				COUNT(u.id) AS kyc_users_count
			FROM public.users u
			WHERE u."kycStatus" = 'completed'
		`;
		const ordersStatsRes = await prisma.$queryRaw`
			SELECT
				SUM(o.amount) AS total_amount_spent,
				SUM(o."quantityInDecimal" / POWER(10, p."tokenDecimals")) AS total_tokens_emitted,
				SUM(o."quantityInDecimal" * p."tokenPrice" / POWER(10, p."tokenDecimals")) AS total_tokens_price
			FROM public.orders o
			INNER JOIN public.projects p ON o."projectId" = p.id
			WHERE (o."status" = 'paid' OR o."status" = 'prepaid' OR o."status" = 'processed' OR o.status = 'preprocessed')
				AND (o."fundsSource" = 'WALLET_EUR' OR o."fundsSource" = 'FREE_CREDITS' OR o."fundsSource" = 'FREE_TOKEN')
		`;
		const projectStatsRes = await prisma.$queryRaw`
			SELECT
				SUM(p."targetPrice") as project_sum_price
			FROM public.projects p
			WHERE p.visibility = 'production' AND p."visibleAt" < NOW()
		`;
		const customerStatsRes = await prisma.$queryRaw`
			SELECT
				COUNT(*) AS customer_count,
				AVG(total_amount_spent) AS average_amount_spent,
				STDDEV(total_amount_spent) AS std_amount_spent,
				PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY total_amount_spent) as median_amount_spent,
				PERCENTILE_CONT(0.9) WITHIN GROUP(ORDER BY total_amount_spent) as ninety_percentile_amount_spent,
				PERCENTILE_CONT(0.99) WITHIN GROUP(ORDER BY total_amount_spent) as ninetynine_percentile_amount_spent
			FROM (
			  SELECT u.id, SUM(o.amount)::float AS total_amount_spent
			  FROM public.users u
			  INNER JOIN public.orders o ON u.id = o."userId" AND (o."status" = 'paid' OR o."status" = 'prepaid' OR o."status" = 'processed' OR o.status = 'preprocessed') AND (o."fundsSource" = 'WALLET_EUR' OR o."fundsSource" = 'FREE_CREDITS' OR o."fundsSource" = 'FREE_TOKEN')
			  GROUP BY u.id
			) subquery;
		`;

		const orderStatsPerFundsSourceRes = await prisma.$queryRaw`
			SELECT
				o."fundsSource",
				SUM(o.amount) AS total_amount_spent,
				SUM(o."quantityInDecimal" / POWER(10, p."tokenDecimals")) AS total_tokens_emitted,
				SUM(o."quantityInDecimal" * p."tokenPrice" / POWER(10, p."tokenDecimals")) AS total_tokens_price
			FROM public.orders o
			INNER JOIN public.projects p ON o."projectId" = p.id
			WHERE (o."status" = 'paid' OR o."status" = 'prepaid' OR o."status" = 'processed' OR o.status = 'preprocessed')
			GROUP BY o."fundsSource"
		`;
		const customerStatsPerFundsSourceRes = await prisma.$queryRaw`
			SELECT
				"fundsSource",
				COUNT(*) AS customer_count,
				AVG(total_amount_spent) AS average_amount_spent
			FROM (
				SELECT u.id, o."fundsSource", SUM(o.amount)::float AS total_amount_spent
				FROM public.users u
				INNER JOIN public.orders o ON u.id = o."userId" AND (o."status" = 'paid' OR o."status" = 'prepaid' OR o."status" = 'processed' OR o.status = 'preprocessed')
				GROUP BY u.id, o."fundsSource"
			) subquery
			GROUP BY "fundsSource";
		`;
		const orderStatsPerFundsSource = orderStatsPerFundsSourceRes.reduce(
			(result, curr) => {
				result[curr.fundsSource] = {
					totalAmountSpent: Number(curr.total_amount_spent),
					totalTokensPrice: Number(curr.total_tokens_price),
					tokenAmount: Number(curr.total_tokens_emitted),
				};
				return result;
			},
			{}
		);
		const customerStatsPerFundsSource =
			customerStatsPerFundsSourceRes.reduce((result, curr) => {
				result[curr.fundsSource] = {
					customerCount: Number(curr.customer_count),
					customerAvgAmount: Number(curr.average_amount_spent),
				};
				return result;
			}, {});

		return {
			orderTotalAmount: Number(ordersStatsRes?.[0]?.total_amount_spent),
			orderTotalTokens: Number(ordersStatsRes?.[0]?.total_tokens_emitted),
			orderTotalTokensPrice: Number(
				ordersStatsRes?.[0]?.total_tokens_price
			),
			aum: Number(projectStatsRes?.[0]?.project_sum_price),
			totalUsersCount: Number(totalUsersStatsRes?.[0]?.total_users_count),
			kycUsersCount: Number(kycUsersStatsRes?.[0]?.kyc_users_count),
			customerCount: Number(customerStatsRes?.[0]?.customer_count),
			customerAvgAmount: Number(
				customerStatsRes?.[0]?.average_amount_spent
			),
			customerStdAmount: Number(customerStatsRes?.[0]?.std_amount_spent),
			customerMedianAmount: Number(
				customerStatsRes?.[0]?.median_amount_spent
			),
			customer90PercentileAmount: Number(
				customerStatsRes?.[0]?.ninety_percentile_amount_spent
			),
			customer99PercentileAmount: Number(
				customerStatsRes?.[0]?.ninetynine_percentile_amount_spent
			),
			customerStatsPerFundsSource,
			orderStatsPerFundsSource,
		};
	}

	@Get('/mangopay')
	@SetHeader('Cache-Control', 'nostore')
	public async mangopayStats(@Req() req: NextApiRequest): Promise<any> {
		return await getMangopayStats();
	}

	@Get('/mangopay/projects')
	@SetHeader('Cache-Control', 'nostore')
	public async mangopayProjectsStats(
		@Req() req: NextApiRequest
	): Promise<any> {
		return await getProjectWalletsStats();
	}

	@Get('/mangopay/disputes')
	@SetHeader('Cache-Control', 'nostore')
	public async mangopayDisputes(@Req() req: NextApiRequest): Promise<any> {
		return await getAllDisputes();
	}
}

export default createHandler(AdminStatsHandler);
