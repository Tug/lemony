import './script-setup';
import { createFreeTokenPool } from '../src/lib/token-claim';
import { getSellerUser } from '../src/lib/user';
import prisma, { Prisma, SchemaTypes } from '../src/lib/prismadb';
import { eurNumber } from '@diversifiedfinance/app/components/checkout/currency-utils';

async function getTokenPoolAmountEur(
	tokenPool: SchemaTypes.FreeTokenPool
): Promise<number> {
	if (!tokenPool.project) {
		tokenPool.project = await prisma.project.findUnique({
			where: { id: tokenPool.projectId },
		});
	}
	return eurNumber(
		new Prisma.Decimal(tokenPool.sizeInDecimal.toString())
			.div(Math.pow(10, tokenPool.project.tokenDecimals))
			.mul(tokenPool.project.tokenPrice)
	);
}

export default async function run({
	projectId,
	userId,
	amount,
	poolId,
}: {
	poolId?: string;
	projectId: string;
	userId?: string;
	amount?: number;
}) {
	if (!userId) {
		userId = (await getSellerUser()).id;
	}
	const tokenPool = poolId
		? await prisma.freeTokenPool.findUniqueOrThrow({
				where: { id: poolId },
		  })
		: await createFreeTokenPool(projectId, userId, amount, {
				useSandbox: false,
				allowLess: true,
		  });
	const amountEur = await getTokenPoolAmountEur(tokenPool);
	console.log(`New free token pool of ${amountEur}€ created`, tokenPool);
	await createFreeTokenPool(projectId, userId, amountEur, {
		useSandbox: true,
		allowLess: false,
	});
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('projectId', {
			type: 'string',
			description: 'Project Id to create a free token pool from',
		})
		.option('userId', {
			type: 'string',
			description: 'User Id who will own the token pool',
		})
		.option('amount', {
			type: 'number',
			description: 'Amount of tokens to include in the pool',
		})
		.option('poolId', {
			type: 'string',
			description:
				'Existing pool id when we just want to retrieve information about a pool or create the sandbox corresponding orders',
		})
		.demandOption(['projectId'], 'At least a project id is required').argv;
	run(args);
}
