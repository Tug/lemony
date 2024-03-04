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