import './script-setup';
import prisma from '../src/lib/prismadb';
import { processBuyOrder } from '../src/lib/orders/market';

export default async function run({
	orderId,
	useSandbox,
}: {
	orderId: string;
	useSandbox: boolean;
}) {
	const buyOrder = await prisma.order.findUniqueOrThrow({
		where: {
			id: orderId,
		},
	});
	await processBuyOrder(buyOrder, { useSandbox: false });
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('orderId', {
			type: 'string',
			description: 'Id of the order to process',
		})
		.option('useSandbox', {
			type: 'boolean',
			description: 'Use payment sandbox',
			default: false,
		}).argv;
	run(args);
}
