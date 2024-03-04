import './script-setup';
import prisma from '../src/lib/prismadb';
import { getTokenQuantityInDecimal } from '../src/lib/checkout/order';
import { Prisma } from '@prisma/client';

export default async function run({
	projectId = 'cli8qvkr0000wl00fj9tg72lf',
	tokenDecimals = 3,
	real = false,
}: {
	projectId: string;
	tokenDecimals: number;
	real: boolean;
}) {
	if (!real) {
		console.log('Running Fake Run');
	} else {
		console.log('Running script for Real!');
	}
	await prisma.$transaction(
		async (tx) => {
			const currentProject = await tx.project.findUniqueOrThrow({
				where: { id: projectId },
				select: { tokenDecimals: true, targetPrice: true },
			});
			console.log(
				`Updating project ${projectId} from tokenDecimals ${currentProject.tokenDecimals} to ${tokenDecimals}`
			);
			const maxSupplyInDecimal = currentProject.targetPrice
				.div(10)
				.mul(Math.pow(10, tokenDecimals))
				.toNumber();
			await tx.project.update({
				where: { id: projectId },
				data: { tokenDecimals, maxSupplyInDecimal },
			});
			const ordersToFix = await tx.order.findMany({
				where: { projectId },
			});
			for (const order of ordersToFix) {
				const quantityInDecimal = await getTokenQuantityInDecimal(
					order.id,
					order.amount,
					{
						useSandbox: false,
					},
					tx
				);
				console.log(
					`Updating order ${order.id} of amount ${order.amount} from quantity ${order.quantityInDecimal} to ${quantityInDecimal}`
				);
				await tx.order.update({
					where: { id: order.id },
					data: {
						quantityInDecimal,
					},
				});
			}
			if (!real) {
				throw new Error('Rollback transaction');
			}
		},
		{
			maxWait: 10000, // default: 2000
			timeout: 50000, // default: 5000
			isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default for CockroachDB
		}
	);
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('projectId', {
			type: 'string',
			description: 'Project id for which to fix the token decimals',
		})
		.option('tokenDecimals', {
			type: 'number',
			description: 'New token decimals to apply',
		})
		.option('real', {
			type: 'boolean',
			description: 'Run for real',
		}).argv;
	run(args);
}
