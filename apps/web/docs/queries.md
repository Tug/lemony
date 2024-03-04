
# Lists all users who have no bank accounts and at least one completed order
```sql
SELECT DISTINCT u.*
FROM users u
JOIN orders o ON u.id = o."userId"
LEFT JOIN userbankaccounts uba ON u.id = uba."userId"
WHERE o.type = 'BUY'
AND o.status IN ('processed', 'prepaid', 'paid')
AND uba.id IS NULL
GROUP BY u.id
HAVING COUNT(o.id) >= 1;
```

# Compare crowdfunding amount and token sold
```sql
SELECT
    p.id AS "projectId",
    p."tokenName",
    COALESCE(SUM(o."quantityInDecimal") * p."tokenPrice" / POWER(10, p."tokenDecimals"), 0) AS "totalSold",
    COALESCE(SUM(o."amount")) AS "totalAmount",
    pcs."collectedAmount",
    p."exitPrice"
FROM
    projects p
inner join projectcrowdfundingstate pcs on p."crowdfundingStateId" = pcs.id 
LEFT JOIN
    orders o ON p.id = o."projectId"
WHERE
    o.type = 'BUY'
    AND o.status IN ('processed', 'paid', 'preprocessed', 'prepaid', 'pendingRefund')
    and "executionType" = 'INITIAL'
GROUP BY
    p.id, pcs."collectedAmount", p."exitPrice";
```

