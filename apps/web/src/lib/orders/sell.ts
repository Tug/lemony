import prisma, { SchemaTypes } from '../prismadb';
import { Decimal } from 'decimal.js';
import cuid from 'cuid';

export async function createSellOrder(
	{
		userId,
		projectId,
		sellQuantityInDecimal,
		amount,
	}: {
		userId: string;
		projectId: string;
		sellQuantityInDecimal: BigInt;
		amount: Decimal.Value;
	},
	{ useSandbox = false }: { useSandbox?: boolean } = {}
): Promise<SchemaTypes.Order> {
	const result = await prisma.$transaction([
		prisma.$queryRawUnsafe<SchemaTypes.Order[]>(
			// This INSERT INTO ... SELECT statement reads from the same table it writes to
			// It should be valid for SERIALIZABLE isolation level (CockroachDB default)
			`
			INSERT INTO ${useSandbox ? 'sandbox.orders' : 'public.orders'} (
				id,
				"createdAt",
				"updatedAt",
				"userId",
				"projectId",
				"quantityInDecimal",
				amount,
				currency,
				status,
				type,
				"executionType",
				version
			)
			SELECT
			  $5,
			  CURRENT_TIMESTAMP,
			  CURRENT_TIMESTAMP,
			  $1,
			  $2,
			  $3,
			  $4,
			  'EUR',
			  'pending',
			  'SELL',
			  'LIMIT',
			  0
			WHERE
			  COALESCE((
				SELECT SUM("quantityInDecimal")
				FROM ${useSandbox ? 'sandbox.orders' : 'public.orders'}
				WHERE "userId" = $1
				AND "projectId" = $2
				AND type = 'BUY'
				AND status IN ('paid', 'processed')
			  ), 0) - COALESCE((
				SELECT SUM("quantityInDecimal")
				FROM ${useSandbox ? 'sandbox.orders' : 'public.orders'}
				WHERE "userId" = $1
				AND "projectId" = $2
				AND type = 'SELL'
				AND status IN ('pending', 'paid', 'processed')
			  ), 0) >= $3
			RETURNING *;
		`,
			userId,
			projectId,
			sellQuantityInDecimal,
			amount,
			cuid()
		),
	]);

	if (result[0].length === 0) {
		throw new Error('Not enough tokens to sell');
	}

	return result[0][0];
}
