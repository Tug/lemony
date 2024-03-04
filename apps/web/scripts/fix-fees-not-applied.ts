import './script-setup';
import prisma, { Decimal } from '../src/lib/prismadb';

export default async function run({ real = false }: { real: boolean }) {
	const orders = await prisma.order.findMany({
		where: {
			projectId: 'clg57cixm000yl3091hb2i3yz',
		},
		include: {
			project: {
				select: {
					tokenDecimals: true,
					tokenPrice: true,
					feesPercent: true,
				},
			},
		},
	});
	const wrongOrders = orders.filter((order) =>
		new Decimal(order.quantityInDecimal.toString()).equals(
			order.amount.mul(100)
		)
	);
	for (const order of wrongOrders) {
		const netAmount = new Decimal(
			order.amount
				.mul(new Decimal(1).sub(order.project.feesPercent.div(100)))
				.toFixed(2)
		);

		const quantityInDecimal = netAmount
			.mul(Math.pow(10, order.project.tokenDecimals))
			.dividedBy(order.project.tokenPrice)
			.round()
			.toNumber();

		if (real) {
			await prisma.order.update({
				where: { id: order.id },
				data: {
					quantityInDecimal,
				},
			});
		}
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).argv;
	run(args);
}
