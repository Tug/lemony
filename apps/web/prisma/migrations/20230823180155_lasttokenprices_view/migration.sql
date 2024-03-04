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
JOIN projects p ON pp."projectId" = p.id