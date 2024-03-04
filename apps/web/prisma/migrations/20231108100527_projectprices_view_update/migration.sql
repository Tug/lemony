DROP MATERIALIZED VIEW IF EXISTS projectprices cascade;

-- New version of projectprices materialized view
CREATE MATERIALIZED VIEW projectprices AS
WITH minmaxdates AS (
    WITH projectperiods AS (
        -- Predefined periods for every project
        SELECT
            id AS "projectId",
            unnest(ARRAY['_1month', '_1year', 'max']) AS period
        FROM projects
        UNION
        -- Actual periods from ProjectPrice
        SELECT
             pinp."projectId",
             oracleprices.period
        FROM oracleprices
        INNER JOIN oracleproducts ON oracleprices."oracleProductId" = oracleproducts.id AND oracleproducts.enabled = true
        JOIN productsinprojects pinp ON oracleproducts."productId" = pinp."productId"
        GROUP BY pinp."projectId", oracleprices.period
    )
    -- Determine the min and max dates of each period
    SELECT
        pr."projectId",
        pr.period,
        COALESCE(
            CASE
                WHEN pr.period = '_1day' THEN (NOW()::date - 1)::timestamp
                WHEN pr.period = '_1week' THEN (date_trunc('day', NOW())::date - INTERVAL '1 week')::timestamp
                WHEN pr.period = '_1month' THEN (date_trunc('day', NOW())::date - INTERVAL '1 month')::timestamp
                WHEN pr.period = '_3month' THEN (date_trunc('day', NOW())::date - INTERVAL '3 month')::timestamp
                WHEN pr.period = '_6month' THEN (date_trunc('week', NOW())::date - INTERVAL '6 month')::timestamp
                WHEN pr.period = '_1year' THEN (date_trunc('month', NOW())::date - INTERVAL '1 year')::timestamp
                ELSE MIN(op.date)
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
    JOIN productsinprojects pinp ON pr."projectId" = pinp."projectId"
    LEFT JOIN oracleproducts ON pinp."productId" = oracleproducts."productId" AND oracleproducts.enabled = true
    LEFT JOIN oracleprices op ON oracleproducts.id = op."oracleProductId" AND pr.period = op.period
    GROUP BY pr."projectId", pr.period
),
timestampseries AS (
   -- Generate a series of timestamps for each project and period based on minmaxdates
   SELECT
      distinct minmaxdates."projectId" as "projectId",
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
   FROM minmaxdates
),
oracleproductprices AS (
    WITH oracleclosestproductprices AS (
        WITH closestdates AS (
            SELECT
                op."oracleProductId",
                ts.period,
                ts.generated_date,
                op.date as closest_date,
                ROW_NUMBER() OVER (
                    PARTITION BY op."oracleProductId", ts.period, ts.generated_date
                    -- This ensures that for each generated_date, the closest past date (if it exists) will always have rn=1
                    -- and only if there's no past date will a future date get rn=1.
                    ORDER BY
                        CASE WHEN ts.generated_date >= op.date THEN 1 ELSE 2 END,
                        CASE WHEN ts.generated_date >= op.date THEN ts.generated_date - op.date ELSE op.date - ts.generated_date END
                ) AS rn
            FROM timestampseries ts
            INNER JOIN productsinprojects pinp ON pinp."projectId" = ts."projectId"
            JOIN oracleproducts ON pinp."productId" = oracleproducts."productId" AND oracleproducts.enabled = true
            JOIN oracleprices op ON op."oracleProductId" = oracleproducts.id
        )
        SELECT
            cd."oracleProductId",
            cd.period,
            cd.generated_date as date,
            op.mean,
            op.min,
            op.max
        FROM closestdates cd
        JOIN oracleprices op ON cd."oracleProductId" = op."oracleProductId" AND cd.closest_date = op.date
        WHERE rn = 1
    )
    SELECT
        pd."productId",
        ocpp.date,
        ocpp.period,
        AVG(ocpp.mean * (1 - pd."hasVAT"::int * (pd."vatPercent" / 100)) * (1 - pd."percentageFees" / 100) - pd."fixedFees") AS avg_oracle_price_mean,
        AVG(ocpp.max * (1 - pd."hasVAT"::int * (pd."vatPercent" / 100)) * (1 - pd."percentageFees" / 100) - pd."fixedFees") AS avg_oracle_price_max,
        AVG(ocpp.min * (1 - pd."hasVAT"::int * (pd."vatPercent" / 100)) * (1 - pd."percentageFees" / 100) - pd."fixedFees") AS avg_oracle_price_min
    FROM oracleclosestproductprices ocpp
    LEFT JOIN oracleproducts pd ON ocpp."oracleProductId" = pd.id
    GROUP BY pd."productId", ocpp.date, ocpp.period
),
resalefees AS (
    -- Calculate the resale fees for each product at month m along the duration period
    SELECT
        productsinprojects."productId",
        productsinprojects."projectId",
        series.month as "month",
        productsinprojects."resaleFeePercent"::decimal(12,2) / 100::decimal(12,2)  * series.month::decimal(12,2) / projects."durationInMonths"::decimal(12,2) AS resale_fee_percent,
        productsinprojects."resaleFeeFixed"::decimal(12,2) * series.month::decimal(12,2) / projects."durationInMonths"::decimal(12,2) AS resale_fee_fixed
    FROM productsinprojects
    JOIN projects ON productsinprojects."projectId" = projects.id
    CROSS JOIN LATERAL generate_series(0, projects."durationInMonths") AS series(month)
),
resalefeesbypricedate AS (
    SELECT
        oracleproductprices."productId",
        oracleproductprices."date",
        oracleproductprices."period",
        COALESCE(
            (SELECT resale_fee_percent
             FROM resalefees
             JOIN projects ON resalefees."projectId" = projects.id
             WHERE resalefees."productId" = oracleproductprices."productId"
             AND resalefees.month = EXTRACT(MONTH FROM AGE(oracleproductprices.date::timestamptz, projects."crowdfundingStartsAt"::timestamptz))
             ORDER BY resalefees.month DESC LIMIT 1), 0) AS resale_fee_percent_at_date,
        COALESCE(
            (SELECT resale_fee_fixed
             FROM resalefees
             JOIN projects ON resalefees."projectId" = projects.id
             WHERE resalefees."productId" = oracleproductprices."productId"
             AND resalefees.month = EXTRACT(MONTH FROM AGE(oracleproductprices.date::timestamptz, projects."crowdfundingStartsAt"::timestamptz))
             ORDER BY resalefees.month DESC LIMIT 1), 0) AS resale_fee_fixed_at_date
    FROM oracleproductprices
),
oracleprojectprices AS (
    -- Calculate the final project price using the given formula
    SELECT
        pinp."projectId",
        pr.period,
        pr.date,
        SUM(pinp.quantity * (
           (pr.avg_oracle_price_mean + (pinp."priceIncludesVAT"::int * pinp."unitPrice"::decimal(12,2) * pinp."vatPercentage"::decimal(12,2) / 100::decimal(12,2))) * (1 - fees.resale_fee_percent_at_date) - fees.resale_fee_fixed_at_date
        ))::DECIMAL(12,2) AS mean,
        SUM(pinp.quantity * (
           (pr.avg_oracle_price_min + (pinp."priceIncludesVAT"::int * pinp."unitPrice"::decimal(12,2) * pinp."vatPercentage"::decimal(12,2) / 100::decimal(12,2))) * (1 - fees.resale_fee_percent_at_date) - fees.resale_fee_fixed_at_date
        ))::DECIMAL(12,2) AS min,
        SUM(pinp.quantity * (
           (pr.avg_oracle_price_max + (pinp."priceIncludesVAT"::int * pinp."unitPrice"::decimal(12,2) * pinp."vatPercentage"::decimal(12,2) / 100::decimal(12,2))) * (1 - fees.resale_fee_percent_at_date) - fees.resale_fee_fixed_at_date
        ))::DECIMAL(12,2) AS max
    FROM oracleproductprices pr
    JOIN resalefeesbypricedate fees ON pr."productId" = fees."productId" AND fees.period = pr.period AND pr.date = fees.date
    JOIN productsinprojects pinp ON pr."productId" = pinp."productId"
    GROUP BY pinp."projectId", pr.period, pr.date
),
fallbackprojectprices AS (
    WITH missingproductprices AS (
        SELECT
            ts."projectId",
            ts."period",
            ts.generated_date
        FROM timestampseries ts
        WHERE NOT EXISTS(
            SELECT 1
            FROM oracleproductprices opp
            INNER JOIN productsinprojects pinp ON pinp."productId" = opp."productId"
            JOIN projects p ON pinp."projectId" = p.id
            WHERE p.id = ts."projectId" AND opp.period = ts.period AND opp.date = ts.generated_date
        )
    )
    SELECT
        mpp."projectId",
        mpp.period,
        mpp.generated_date as date,
        p."targetPrice" * (1 + (GREATEST(0, EXTRACT(MONTH FROM AGE(generated_date::timestamptz, p."crowdfundingStartsAt"::timestamptz))::DECIMAL(12,2))) * p."expectedAPR" / 100 / 12) AS mean,
        p."targetPrice" as min,
        p."targetPrice" * (1 + (GREATEST(0, EXTRACT(MONTH FROM AGE(generated_date::timestamptz, p."crowdfundingStartsAt"::timestamptz))::DECIMAL(12,2))) * p."expectedAPR" / 100 / 12) AS max
    FROM missingproductprices mpp
    JOIN projects p ON p.id = mpp."projectId"
),
finalprojectprices AS (
    SELECT "projectId", period, date, mean, min, max
    FROM oracleprojectprices
    UNION
    SELECT "projectId", period, date, mean, min, max
    FROM fallbackprojectprices
)
SELECT "projectId", period, date, mean, min, max FROM finalprojectprices;

-- CreateIndex
CREATE INDEX "projectprices_projectId_period_date_idx" ON public."projectprices"("projectId", "period", "date") STORING ("mean", "min", "max");

-- Recreate usertokens view
CREATE VIEW public."usertokens" AS
WITH lastprojectdates AS (
    SELECT
        "projectId",
        MAX(date) as latest_date
    FROM "projectprices"
    GROUP BY "projectId"
),
lasttokenprices AS (
    SELECT
        pp."projectId",
        CAST(pp."mean" * POWER(10, p."tokenDecimals") / p."maxSupplyInDecimal" AS DECIMAL(12,2)) AS "unitPrice"
    FROM "projectprices" pp
    JOIN lastprojectdates lpd ON pp."projectId" = lpd."projectId" AND pp.date = lpd.latest_date
    JOIN "projects" p ON pp."projectId" = p.id
)
SELECT
    o."userId",
    o."projectId",
    SUM(o.amount) AS "amountSpent",
    MAX(o.currency) AS "currency",
    p."tokenPrice" AS "initialPrice",
    p."tokenPrice" * SUM(o."quantityInDecimal") / POWER(10, p."tokenDecimals") AS "initialValue",
    SUM(o."quantityInDecimal") / POWER(10, p."tokenDecimals") AS "quantity",
    CAST(ltp."unitPrice" AS DECIMAL(12,2)) AS "lastPrice",
    CAST((SUM(o."quantityInDecimal") / POWER(10, p."tokenDecimals")) * ltp."unitPrice" AS DECIMAL(12,2)) AS "lastValue"
FROM "orders" o
JOIN "projects" p ON o."projectId" = p.id
JOIN lasttokenprices ltp ON o."projectId" = ltp."projectId"
WHERE o.status IN ('paid', 'processed')
GROUP BY o."userId", o."projectId", ltp."unitPrice", p."tokenDecimals", p."tokenPrice";

-- Recreate usertokens view on sandbox schema
CREATE VIEW sandbox."usertokens" AS
WITH lastprojectdates AS (
    SELECT
        "projectId",
        MAX(date) as latest_date
    FROM "projectprices"
    GROUP BY "projectId"
),
lasttokenprices AS (
    SELECT
        pp."projectId",
        CAST(pp."mean" * POWER(10, p."tokenDecimals") / p."maxSupplyInDecimal" AS DECIMAL(12,2)) AS "unitPrice"
    FROM "projectprices" pp
    JOIN lastprojectdates lpd ON pp."projectId" = lpd."projectId" AND pp.date = lpd.latest_date
    JOIN "projects" p ON pp."projectId" = p.id
)
SELECT
    o."userId",
    o."projectId",
    SUM(o.amount) AS "amountSpent",
    MAX(o.currency) AS "currency",
    p."tokenPrice" AS "initialPrice",
    p."tokenPrice" * SUM(o."quantityInDecimal") / POWER(10, p."tokenDecimals") AS "initialValue",
    SUM(o."quantityInDecimal") / POWER(10, p."tokenDecimals") AS "quantity",
    CAST(ltp."unitPrice" AS DECIMAL(12,2)) AS "lastPrice",
    CAST((SUM(o."quantityInDecimal") / POWER(10, p."tokenDecimals")) * ltp."unitPrice" AS DECIMAL(12,2)) AS "lastValue"
FROM sandbox."orders" o
JOIN "projects" p ON o."projectId" = p.id
JOIN lasttokenprices ltp ON o."projectId" = ltp."projectId"
WHERE o.status IN ('paid', 'processed')
GROUP BY o."userId", o."projectId", ltp."unitPrice", p."tokenDecimals", p."tokenPrice";


-- Recreate lasttokenprices view
CREATE VIEW lasttokenprices AS
WITH lastprojectdates AS (
    SELECT
        "projectId",
        MAX(date) as latest_date
    FROM projectprices
    where "period" = '_1month'
    GROUP BY "projectId"
)
SELECT
    pp."projectId",
    CAST(pp.mean * POWER(10, p."tokenDecimals") / p."maxSupplyInDecimal" AS DECIMAL(12,2)) AS mean,
    CAST(pp.min * POWER(10, p."tokenDecimals") / p."maxSupplyInDecimal" AS DECIMAL(12,2)) AS min,
    CAST(pp.max * POWER(10, p."tokenDecimals") / p."maxSupplyInDecimal" AS DECIMAL(12,2)) AS max,
    'EUR' as currency
FROM projectprices pp
JOIN lastprojectdates lpd ON pp."projectId" = lpd."projectId" AND pp.date = lpd.latest_date
JOIN projects p ON pp."projectId" = p.id;


-- Recreate tokenprices view
CREATE VIEW tokenprices AS
SELECT
    pp."projectId",
    pp."period",
    pp."date",
    CAST(pp."mean" * POWER(10, p."tokenDecimals") / p."maxSupplyInDecimal" AS DECIMAL(12,2)) AS "mean",
    CAST(pp."min" * POWER(10, p."tokenDecimals") / p."maxSupplyInDecimal" AS DECIMAL(12,2)) AS "min",
    CAST(pp."max" * POWER(10, p."tokenDecimals") / p."maxSupplyInDecimal" AS DECIMAL(12,2)) AS "max"
FROM projectprices pp
JOIN projects p ON pp."projectId" = p.id;

