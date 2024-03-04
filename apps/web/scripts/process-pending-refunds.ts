import './script-setup';
import {
	processPendingRefunds,
	userHasMadePaymentSinceOrderUpdate,
} from '../src/lib/orders/refund';

export default async function run({
	limit = 100,
	daysOnWallet = 3,
}: {
	limit?: number;
	daysOnWallet?: number;
}) {
	// const order = await prisma.order.findUniqueOrThrow({
	// 	where: {
	// 		id: 'clsel7z80000bjp0fysk7qxf7',
	// 	},
	// 	include: {
	// 		...orderForProjectIncludes,
	// 		user: true,
	// 	},
	// });
	// await userHasMadePaymentSinceOrderUpdate(order.user, order, 600);
	await processPendingRefunds({
		limit,
		daysOnWallet,
		verbose: true,
	});
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).argv;
	run(args);
}
