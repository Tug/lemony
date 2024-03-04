import './script-setup';
import { refundProject } from '../src/lib/orders/refund';

export default async function run({
	projectId,
	refundOrders = false,
}: {
	projectId: string;
	refundOrders?: boolean;
}) {
	await refundProject({
		projectId,
		failed: true,
		refundOrdersNow: refundOrders,
		verbose: true,
	});
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('projectId', {
			type: 'string',
			description: 'Project Id to refund',
		})
		.option('refundOrders', {
			type: 'boolean',
			description: 'Refund all project orders immediately',
		}).argv;
	run(args);
}
