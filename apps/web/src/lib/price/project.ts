import prisma from '../prismadb';
import { readFile } from 'fs/promises';
import { PriceResult } from './types';

/**
 * How project price is calculated from oracle prices
 *
 * PP(t): Project price at time t
 *   t is updated every month. For a 5y project it goes from 0 to 60 (months).
 * Quantity(p): Quantity of products of type p in project
 * P_Oracle(o, p, t): Price of a product p at time t given by oracle o
 * VAT_Oracle(o, p): VAT of a product p price given by oracle o
 * fees_oracle_percent(o, p): Percentage fee of the oracle o when selling product p
 * fees_oracle_fixed(o, p): Fixed fee of the oracle o when selling product p
 * VAT_initial(p): VAT of product p when bought by diversified
 * Fees_Resale(p, t): Resale fees of product p at time t.
 * 	 Fees_Resale(p, investment_period) is known/estimated at the beginning of the project
 *
 * PP(t) =
 * 		SUM_of_products_p {
 * 			Quantity(p) * (
 * 				AVG_of_oracles_o {
 * 					P_Oracle(o, p, t) * (1 - VAT_Oracle(o, p)) * (1 - fees_oracle_percent(o, p))
 * 					- fees_oracle_fixed(o, p)
 * 				}
 * 				+ VAT_initial(p)
 * 			) * (t / investment_period) * (1 - Fees_Resale(p, investment_period))
 * 		}
 *
 * More details on how this view was generated is available in this
 * ChatGPT4 Conversation:
 * https://chat.openai.com/share/630aec91-0e1e-4614-b334-9613ad2fa71a
 *
 * Currently, this function is not called, we rely on migrations to
 * modify/update the materialized view.
 */
export async function recreateProjectPrices() {
	await prisma.$queryRawUnsafe(`
		DROP MATERIALIZED VIEW IF EXISTS projectprices;
		${await readFile(
			'../../../prisma/migrations/20230814074518_projectprices_view/migration.sql'
		)}
	`);
}

export async function getAvailableProjectPrices(
	projectId: string,
	{ noPriceDuringCrowdfunding = false } = {}
): Promise<Array<PriceResult>> {
	if (noPriceDuringCrowdfunding) {
		return await prisma.$queryRaw`
			WITH project_cutoff AS (
				SELECT
					p.id AS "projectId",
					p.percent,
					p."crowdfundingStartsAt",
					CASE
						WHEN p.percent < 100 THEN p."crowdfundingStartsAt"
						ELSE NOW()
					END AS cutoff_date
				FROM projects p
				WHERE p.id = ${projectId}
			)
			SELECT
				pp.*
			FROM projectprices pp
			JOIN project_cutoff pc ON pp."projectId" = pc."projectId"
			WHERE pp."projectId" = ${projectId}
				AND pp.date <= pc.cutoff_date
				AND EXISTS (
					SELECT 1
					FROM oracleprices
					INNER JOIN oracleproducts ON oracleprices."oracleProductId" = oracleproducts.id AND oracleproducts.enabled = true
					JOIN productsinprojects ON productsinprojects."productId" = oracleproducts."productId"
					WHERE pp.period = oracleprices.period AND pp."projectId" = productsinprojects."projectId"
				)
			ORDER BY pp.period, pp.date ASC
		`;
	}

	return await prisma.$queryRaw`
		SELECT
			projectprices.*
		FROM projectprices
		WHERE projectprices."projectId" = ${projectId} AND EXISTS (
			SELECT 1
			FROM oracleprices
			JOIN oracleproducts ON oracleprices."oracleProductId" = oracleproducts.id
			JOIN productsinprojects ON productsinprojects."productId" = oracleproducts."productId"
			WHERE projectprices.period = oracleprices.period AND projectprices."projectId" = productsinprojects."projectId"
		)
		ORDER BY projectprices.period, projectprices.date ASC
	`;
}

export async function getLatestProjectPrice(
	projectId: string,
	{ noPriceDuringCrowdfunding = false } = {}
): Promise<PriceResult> {
	let results;
	if (noPriceDuringCrowdfunding) {
		results = await prisma.$queryRaw`
			WITH project_cutoff AS (
				SELECT
					p.id AS "projectId",
					p.percent,
					p."crowdfundingStartsAt",
					CASE
						WHEN p.percent < 100 THEN p."crowdfundingStartsAt"
						ELSE NOW()
					END AS cutoff_date
				FROM projects p
				WHERE p.id = ${projectId}
			)
			SELECT
				pp.*
			FROM projectprices pp
			JOIN project_cutoff pc ON pp."projectId" = pc."projectId"
			WHERE pp."projectId" = ${projectId} 
				AND period = '_1month'
				AND pp.date <= pc.cutoff_date
			ORDER BY pp.date DESC
			LIMIT 1
		`;
	} else {
		results = await prisma.$queryRaw`
			SELECT
				pp.*
			FROM projectprices pp
			WHERE pp."projectId" = ${projectId} 
				AND period = '_1month'
			ORDER BY pp.date DESC
			LIMIT 1
		`;
	}

	return results?.[0];
}

export async function updateProjectsComputedAPR() {
	await prisma.$queryRaw`
		WITH startingprice AS (
			SELECT 
				p.id as "projectId",
				pp.period,
				pp.mean
			FROM projects p
			JOIN LATERAL (
				SELECT mean, date, period
				FROM projectprices
				WHERE "projectId" = p.id AND period = 'max'
				AND date BETWEEN p."crowdfundingStartsAt" - INTERVAL '3 MONTH' AND p."crowdfundingStartsAt" + INTERVAL '1 MONTH'
				ORDER BY ABS(EXTRACT(EPOCH FROM (p."crowdfundingStartsAt" - date)))
				LIMIT 1
			) pp ON TRUE
		),
		xmonthsbeforeprice AS (
			SELECT 
				p.id as "projectId",
				pp.period,
				pp.mean
			FROM projects p
			JOIN LATERAL (
				SELECT mean, date, period
				FROM projectprices
				WHERE "projectId" = p.id AND period = 'max'
				AND date BETWEEN p."crowdfundingStartsAt" - p."yearsForAPRCalculation" * INTERVAL '1 YEAR' - INTERVAL '6 MONTH' AND p."crowdfundingStartsAt" - p."yearsForAPRCalculation" * INTERVAL '1 YEAR' + INTERVAL '6 MONTH'
				ORDER BY ABS(EXTRACT(EPOCH FROM (p."crowdfundingStartsAt" - p."yearsForAPRCalculation" * INTERVAL '1 YEAR' - date)))
				LIMIT 1
			) pp ON TRUE
		),
		aprvalues AS (
			SELECT
				sp."projectId",
				sp.period,
				CASE 
					WHEN xmbp.mean IS NULL OR xmbp.mean = 0 THEN NULL
					ELSE 100 * (sp.mean - xmbp.mean) / xmbp.mean / p."yearsForAPRCalculation"
				END AS "APR"
			FROM startingprice sp
			LEFT JOIN xmonthsbeforeprice xmbp ON sp."projectId" = xmbp."projectId"
			JOIN projects p ON sp."projectId" = p.id
		)
		UPDATE projects
		SET "computedAPR" = aprvalues."APR"
		FROM aprvalues
		WHERE projects.id = aprvalues."projectId";
	`;
}

export async function refreshProjectPrices() {
	await prisma.$queryRaw`REFRESH MATERIALIZED VIEW public."projectprices"`;
}
