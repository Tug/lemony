import './script-setup';
import { refundProject } from '../src/lib/orders/refund';

export default async function run({
	projectId,
	failed = false,
	refundOrders = false,
	refundPayments = false,
	useSandbox,
	emailTemplateId,
	wireRefPattern,
	exitPrice,
}: {
	projectId: string;
	failed?: boolean;
	refundOrders?: boolean;
	refundPayments?: boolean;
	useSandbox?: boolean;
	emailTemplateId?: string;
	wireRefPattern?: string;
	exitPrice?: string;
}) {
	await refundProject({
		projectId,
		failed,
		refundOrdersNow: refundOrders,
		refundPaymentsNow: refundPayments,
		verbose: true,
		useSandbox,
		emailTemplateId,
		wireRefPattern,
		exitPrice,
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
			description: 'Refund orders immediately',
		})
		.option('refundPayments', {
			type: 'boolean',
			description: 'Refund payments immediately',
		})
		.option('failed', {
			type: 'boolean',
			description: 'Presale failed',
		})
		.option('wireRefPattern', {
			type: 'string',
			description: 'Match orders Wire Reference using a regex or string',
		})
		.option('exitPrice', {
			type: 'string',
			description:
				'Exit price for the project to match the wire ref amount',
		})
		.option('useSandbox', {
			type: 'boolean',
			description: 'Use sandbox',
		})
		.option('emailTemplateId', {
			type: 'string',
			description: 'Custom template id for refund email',
		}).argv;
	run(args);
}
