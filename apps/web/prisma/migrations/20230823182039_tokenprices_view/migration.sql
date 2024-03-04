CREATE VIEW tokenprices AS
SELECT
    pp."projectId",
    pp."period",
    pp."date",
    CAST(pp."mean" * POWER(10, p."tokenDecimals") / p."maxSupplyInDecimal" AS DECIMAL(12,2)) AS "mean",
    CAST(pp."min" * POWER(10, p."tokenDecimals") / p."maxSupplyInDecimal" AS DECIMAL(12,2)) AS "min",
    CAST(pp."max" * POWER(10, p."tokenDecimals") / p."maxSupplyInDecimal" AS DECIMAL(12,2)) AS "max"
FROM projectprices pp
JOIN projects p ON pp."projectId" = p.id
