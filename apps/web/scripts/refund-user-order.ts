import './script-setup';
import { refundOrder } from '../src/lib/orders/refund';

export default async function run({
	orderId,
	refundPayment = false,
	useSandbox = false,
	refundReason,
	emailTemplateId,
}: {
	orderId?: string;
	refundPayment?: boolean;
	useSandbox?: boolean;
	refundReason?: string;
	emailTemplateId?: string;
}) {
	await refundOrder({
		orderId,
		refundPayment,
		useSandbox,
		refundReason,
		verbose: true,
		force: true,
		emailTemplateId,
	});
	// const orderCollection = useSandbox ? prisma.sandboxOrder : prisma.order;
	// const order = await orderCollection.findUniqueOrThrow({
	// 	where: {
	// 		id: orderId,
	// 	},
	// 	include: {
	// 		...orderForProjectIncludes,
	// 		user: true,
	// 	},
	// });
	// await payoutUserWithFallback(order.user, order.amount, order.createdAt, {
	// 	useSandbox,
	// 	refundReason: 'Project refunded',
	// });
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('orderId', {
			type: 'string',
			description: 'Order Id to refund',
		})
		.option('refundPayment', {
			type: 'boolean',
			description: 'Refund payment immediately',
		})
		.option('useSandbox', {
			type: 'boolean',
			description: 'Use sandbox orders',
		})
		.option('refundReason', {
			type: 'string',
			description: 'Reason for the refund',
		})
		.option('emailTemplateId', {
			type: 'string',
			description: 'Email template to use for the refund email',
		}).argv;
	run(args);
}
