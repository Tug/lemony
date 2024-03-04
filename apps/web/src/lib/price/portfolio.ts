import prisma from '../prismadb';
import { getUser } from '../auth';
import { getPaymentContextForUser } from '../payment/client';
import type { PriceResult } from './types';

export async function getPortfolioHistoricPerformance(
	userId: string,
	{ noPriceDuringCrowdfunding = false } = {}
): Promise<Array<PriceResult>> {
	const user = await getUser(userId);
	const { useSandbox } = getPaymentContextForUser(user);
	const orderCollection = useSandbox ? 'sandbox.orders' : 'public.orders';
	// it's ok to use $queryRawUnsafe here:
	// - `orderCollection` is not user input
	// - `user.id` is not user input
	if (noPriceDuringCrowdfunding) {
		return await prisma.$queryRawUnsafe(`
			WITH userordersum AS (
				-- Sum of quantities for each user, project, dates
				SELECT
					o1."userId",
					o1."projectId",
					o1."createdAt" AS order_date,
					SUM(o1."quantityInDecimal") AS quantity
				FROM ${orderCollection} o1
				WHERE o1."userId" = '${user.id}' AND (o1."status" = 'paid' or o1."status" = 'prepaid' or o1."status" = 'processed' or o1.status = 'preprocessed')
				GROUP BY o1."userId", o1."projectId", o1."createdAt"
			),
			minmaxdates AS (
				WITH projectperiods AS (
					-- Predefined periods for every project
					SELECT
						id AS "projectId",
						unnest(ARRAY['_1month', '_1year', 'max']) AS period
					FROM projects
					WHERE id IN (SELECT DISTINCT "projectId" FROM userordersum)
					UNION
					-- Actual periods from ProjectPrice
					SELECT DISTINCT
						"projectId",
						period
					FROM projectprices
					WHERE "projectId" IN (SELECT DISTINCT "projectId" FROM userordersum)
				)
				-- Determine the min and max dates of each period
				SELECT
					pr.period,
					COALESCE(
						CASE
							WHEN pr.period = '_1day' THEN (NOW()::date - 1)::timestamp
							WHEN pr.period = '_1week' THEN (date_trunc('day', NOW())::date - INTERVAL '1 week')::timestamp
							WHEN pr.period = '_1month' THEN (date_trunc('day', NOW())::date - INTERVAL '1 month')::timestamp
							WHEN pr.period = '_3month' THEN (date_trunc('day', NOW())::date - INTERVAL '3 month')::timestamp
							WHEN pr.period = '_6month' THEN (date_trunc('week', NOW())::date - INTERVAL '6 month')::timestamp
							WHEN pr.period = '_1year' THEN (date_trunc('month', NOW())::date - INTERVAL '1 year')::timestamp
							ELSE MIN(pp.date)
						END,
						CASE
							WHEN pr.period = '_1month' THEN (date_trunc('day', NOW())::date - INTERVAL '1 month')::timestamp
							WHEN pr.period = '_1year' THEN (date_trunc('month', NOW())::date - INTERVAL '1 year')::timestamp
							WHEN pr.period = 'max' THEN (date_trunc('month', NOW())::date - INTERVAL '5 year')::timestamp
						END
					) AS min_t,
					MAX(
						CASE
							WHEN pr.period = '_1day' THEN (NOW()::date)::timestamp
							WHEN pr.period = '_1month' THEN (date_trunc('day', NOW())::date)::timestamp
							ELSE (date_trunc('month', NOW())::date)::timestamp
						END
					) AS max_t
				FROM projectperiods pr 
				LEFT JOIN projectprices pp ON pp."projectId" = pr."projectId" AND pp.period = pr.period
				GROUP BY pr.period 
			),
			dateseries AS (
			   -- Generate a series of timestamps for each project and period based on MinMaxDates
			   SELECT
					 distinct userordersum."projectId" as "projectId",
				  minmaxdates.period,
				  generate_series(
					 minmaxdates.min_t,
					 minmaxdates.max_t,
					 CASE
						WHEN minmaxdates.period = '_1day' THEN '1 hour'::interval
						WHEN minmaxdates.period = '_1week' THEN '6 hour'::interval
						WHEN minmaxdates.period = '_1month' THEN '1 day'::interval
						WHEN minmaxdates.period = '_3month' THEN '1 day'::interval
						WHEN minmaxdates.period = '_6month' THEN '1 week'::interval
						WHEN minmaxdates.period = '_1year' THEN '1 week'::interval
						ELSE '1 month'::interval
					 END
				  ) AS generated_date
			   FROM userordersum
			   CROSS JOIN minmaxdates 
			   GROUP BY "projectId", minmaxdates.period, generated_date
			),
			closestprojectpricedates AS (
				WITH lowerdates AS (
					SELECT
						ds."projectId",
						ds.period,
						ds.generated_date,
						MAX(pp.date) AS lower_date
					FROM dateseries ds
					LEFT JOIN projectprices pp ON ds."projectId" = pp."projectId" AND ds.period = pp.period AND pp.date <= ds.generated_date
					GROUP BY ds."projectId", ds.period, ds.generated_date
				),
				upperdates AS (
					SELECT
						ds."projectId",
						ds.period,
						ds.generated_date,
						MIN(
							CASE 
								WHEN p.percent < 100 THEN LEAST(p."crowdfundingStartsAt", pp.date)
								ELSE pp.date
							END
						) AS upper_date
					FROM dateseries ds
					LEFT JOIN projectprices pp ON ds."projectId" = pp."projectId" AND ds.period = pp.period AND pp.date > ds.generated_date
					JOIN projects p ON ds."projectId" = p.id
					GROUP BY ds."projectId", ds.period, ds.generated_date
				)
				SELECT
					l."projectId",
					l.period,
					l.generated_date as date,
					COALESCE(
						CASE
							WHEN u.upper_date IS NULL OR (l.generated_date - l.lower_date) <= (u.upper_date - l.generated_date) THEN l.lower_date
							ELSE u.upper_date
						END,
						l.lower_date,
						u.upper_date
					) AS closest_date
				FROM lowerdates l
				JOIN upperdates u ON l."projectId" = u."projectId" AND l.period = u.period AND l.generated_date = u.generated_date
			),
			userportfolioprices AS (
				 -- Calculate the portfolio price for each user, period and timestamp t
				 SELECT
					ds.period,
					ds.generated_date as date,
					SUM(uos.quantity * COALESCE(pp.mean, p."targetPrice") / p."maxSupplyInDecimal") AS mean,
					SUM(uos.quantity * COALESCE(pp.min, p."targetPrice") / p."maxSupplyInDecimal") AS min,
					SUM(uos.quantity * COALESCE(pp.max, p."targetPrice") / p."maxSupplyInDecimal") AS max
				 FROM userordersum uos
				 JOIN projects p ON uos."projectId" = p.id
				 JOIN dateseries ds ON uos."projectId" = ds."projectId"
				 JOIN closestprojectpricedates ppd ON ppd."projectId" = ds."projectId" AND ppd.period = ds.period AND ppd.date = ds.generated_date
				 LEFT JOIN projectprices pp on ppd."projectId" = pp."projectId" AND ppd.period = pp.period AND pp.date = ppd.closest_date
				 GROUP BY uos."userId", ds.generated_date, ds.period
			)
			SELECT * FROM userportfolioprices ORDER BY period, date;
		`);
	}
	return await prisma.$queryRawUnsafe(`
		WITH userordersum AS (
            -- Sum of quantities for each user, project, dates
            SELECT
                o1."userId",
                o1."projectId",
                o1."createdAt" AS order_date,
                SUM(o1."quantityInDecimal") AS quantity
            FROM ${orderCollection} o1
            WHERE o1."userId" = '${user.id}' AND (o1."status" = 'paid' or o1."status" = 'prepaid' or o1."status" = 'processed' or o1."status" = 'preprocessed')
            GROUP BY o1."userId", o1."projectId", o1."createdAt"
        ),
        minmaxdates AS (
			WITH projectperiods AS (
				-- Predefined periods for every project
				SELECT
					id AS "projectId",
					unnest(ARRAY['_1month', '_1year', 'max']) AS period
				FROM projects
				WHERE id IN (SELECT DISTINCT "projectId" FROM userordersum)
				UNION
				-- Actual periods from ProjectPrice
				SELECT DISTINCT
					"projectId",
					period
				FROM projectprices
				WHERE "projectId" IN (SELECT DISTINCT "projectId" FROM userordersum)
			)
			-- Determine the min and max dates of each period
			SELECT
				pr.period,
				COALESCE(
					CASE
						WHEN pr.period = '_1day' THEN (NOW()::date - 1)::timestamp
						WHEN pr.period = '_1week' THEN (date_trunc('day', NOW())::date - INTERVAL '1 week')::timestamp
						WHEN pr.period = '_1month' THEN (date_trunc('day', NOW())::date - INTERVAL '1 month')::timestamp
						WHEN pr.period = '_3month' THEN (date_trunc('day', NOW())::date - INTERVAL '3 month')::timestamp
						WHEN pr.period = '_6month' THEN (date_trunc('week', NOW())::date - INTERVAL '6 month')::timestamp
						WHEN pr.period = '_1year' THEN (date_trunc('month', NOW())::date - INTERVAL '1 year')::timestamp
						ELSE MIN(pp.date)
					END,
					CASE
						WHEN pr.period = '_1month' THEN (date_trunc('day', NOW())::date - INTERVAL '1 month')::timestamp
						WHEN pr.period = '_1year' THEN (date_trunc('month', NOW())::date - INTERVAL '1 year')::timestamp
						WHEN pr.period = 'max' THEN (date_trunc('month', NOW())::date - INTERVAL '5 year')::timestamp
					END
				) AS min_t,
				MAX(
					CASE
						WHEN pr.period = '_1day' THEN (NOW()::date)::timestamp
						WHEN pr.period = '_1month' THEN (date_trunc('day', NOW())::date)::timestamp
						ELSE (date_trunc('month', NOW())::date)::timestamp
					END
				) AS max_t
			FROM projectperiods pr 
			LEFT JOIN projectprices pp ON pp."projectId" = pr."projectId" AND pp.period = pr.period
			GROUP BY pr.period 
		),
		dateseries AS (
           -- Generate a series of timestamps for each project and period based on MinMaxDates
           SELECT
                 distinct userordersum."projectId" as "projectId",
              minmaxdates.period,
              generate_series(
                 minmaxdates.min_t,
                 minmaxdates.max_t,
                 CASE
                    WHEN minmaxdates.period = '_1day' THEN '1 hour'::interval
                    WHEN minmaxdates.period = '_1week' THEN '6 hour'::interval
                    WHEN minmaxdates.period = '_1month' THEN '1 day'::interval
                    WHEN minmaxdates.period = '_3month' THEN '1 day'::interval
                    WHEN minmaxdates.period = '_6month' THEN '1 week'::interval
                    WHEN minmaxdates.period = '_1year' THEN '1 week'::interval
                    ELSE '1 month'::interval
                 END
              ) AS generated_date
           FROM userordersum
           CROSS JOIN minmaxdates 
           GROUP BY "projectId", minmaxdates.period, generated_date
        ),
		closestprojectpricedates AS (
			WITH lowerdates AS (
				SELECT
					ds."projectId",
					ds.period,
					ds.generated_date,
					MAX(pp.date) AS lower_date
				FROM dateseries ds
				LEFT JOIN projectprices pp ON ds."projectId" = pp."projectId" AND ds.period = pp.period AND pp.date <= ds.generated_date
				GROUP BY ds."projectId", ds.period, ds.generated_date
			),
			upperdates AS (
				SELECT
					ds."projectId",
					ds.period,
					ds.generated_date,
					MIN(pp.date) AS upper_date
				FROM dateseries ds
				LEFT JOIN projectprices pp ON ds."projectId" = pp."projectId" AND ds.period = pp.period AND pp.date > ds.generated_date
				GROUP BY ds."projectId", ds.period, ds.generated_date
			)
			SELECT
				l."projectId",
				l.period,
				l.generated_date as date,
				COALESCE(
					CASE
						WHEN u.upper_date IS NULL OR (l.generated_date - l.lower_date) <= (u.upper_date - l.generated_date) THEN l.lower_date
						ELSE u.upper_date
					END,
					l.lower_date,
					u.upper_date
				) AS closest_date
			FROM lowerdates l
			JOIN upperdates u ON l."projectId" = u."projectId" AND l.period = u.period AND l.generated_date = u.generated_date
		),
		userportfolioprices AS (
			 -- Calculate the portfolio price for each user, period and timestamp t
			 SELECT
			 	ds.period,
				ds.generated_date as date,
                SUM(uos.quantity * COALESCE(pp.mean, p."targetPrice") / p."maxSupplyInDecimal") AS mean,
                SUM(uos.quantity * COALESCE(pp.min, p."targetPrice") / p."maxSupplyInDecimal") AS min,
                SUM(uos.quantity * COALESCE(pp.max, p."targetPrice") / p."maxSupplyInDecimal") AS max
			 FROM userordersum uos
			 JOIN projects p ON uos."projectId" = p.id
			 JOIN dateseries ds ON uos."projectId" = ds."projectId"
			 JOIN closestprojectpricedates ppd ON ppd."projectId" = ds."projectId" AND ppd.period = ds.period AND ppd.date = ds.generated_date
			 LEFT JOIN projectprices pp on ppd."projectId" = pp."projectId" AND ppd.period = pp.period AND pp.date = ppd.closest_date
			 GROUP BY uos."userId", ds.generated_date, ds.period
		)
		SELECT * FROM userportfolioprices ORDER BY period, date;
	`);
}
