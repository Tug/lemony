import './script-setup';
import {
	processOrder,
	processOrders,
	processPresaleOrders,
} from '../src/lib/payment/cron';

export default async function run({
	orderId,
	useSandbox,
}: {
	orderId?: string;
	useSandbox: boolean;
}) {
	if (orderId) {
		await processOrder(orderId, { useSandbox });
		return;
	}
	await processOrders();
	await processPresaleOrders();
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
