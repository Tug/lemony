import './script-setup';
import prisma, { Decimal } from '../src/lib/prismadb';
import { getNetAmountAndFeesV101 } from '../src/lib/payment/utils';

export default async function run({ real = false }: { real: boolean }) {
	const orders = await prisma.order.findMany({
		where: {
			createdAt: {
				gt: new Date('2023-11-03 16:10:43.697'),
			},
			fundsSource: 'WALLET_EUR',
			type: 'BUY',
			status: 'processed',
		},
		include: {
			project: {
				select: {
					tokenDecimals: true,
					tokenPrice: true,
					feesPercent: true,
					isPresale: true,
				},
			},
		},
	});
	for (const order of orders) {
		const { netAmount } = getNetAmountAndFeesV101(
			order.amount,
			order.project
		);

		const newQuantityInDecimal = BigInt(
			netAmount
				.mul(Math.pow(10, order.project.tokenDecimals))
				.dividedBy(order.project.tokenPrice)
				.round()
				.toString()
		);

		if (order.quantityInDecimal !== newQuantityInDecimal && real) {
			await prisma.order.update({
				where: { id: order.id },
				data: {
					quantityInDecimal: newQuantityInDecimal,
					status: order.project.isPresale ? 'prepaid' : 'paid',
				},
			});
		}
	}
	const projectOrdersSum = await prisma.$queryRaw`
		select
			o."projectId",
			p."tokenName",
			p."crowdfundingStateId",
			cf."collectedAmount",
			SUM(o."quantityInDecimal") as dified_total,
			p."tokenPrice" * SUM(o."quantityInDecimal") / POWER(10, p."tokenDecimals") AS "crowdfundedEur"
		from orders o
		join (
			select distinct "projectId" from orders
			where "fundsSource" = 'WALLET_EUR' and ("status" = 'processed' or "status" = 'paid') and "createdAt" > '2023-11-03 16:10:43.697'
		) o2 on o."projectId" = o2."projectId"
		join projects p on p.id = o."projectId"
		inner join projectcrowdfundingstate cf on p."crowdfundingStateId" = cf.id and cf."collectedAmount" < cf."maximumAmount"
		where (o."status" = 'processed' or o."status" = 'paid' or o."status" = 'prepaid')
		group by o."projectId", p."tokenDecimals", p."tokenName", p."tokenPrice", p."crowdfundingStateId", cf."collectedAmount"
	`;
	for (const pos of projectOrdersSum) {
		const crowdfundedEur = new Decimal(pos.crowdfundedEur);
		if (!crowdfundedEur.equals(pos.collectedAmount)) {
			console.log(
				'Updating',
				pos.tokenName,
				'from',
				pos.collectedAmount,
				'to',
				pos.crowdfundedEur
			);
			if (real) {
				await prisma.projectCrowdfundingState.update({
					where: {
						id: pos.crowdfundingStateId,
					},
					data: {
						collectedAmount: pos.crowdfundedEur,
					},
				});
			}
		}
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).argv;
	run(args);
}
