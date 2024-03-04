import './script-setup';
import prisma from '../src/lib/prismadb';

export default async function run() {
	const customers: Array<{ id: string }> = await prisma.$queryRaw`
			SELECT DISTINCT u.id
			FROM users u
			JOIN orders o ON u.id = o."userId"
			LEFT JOIN userlabels ul ON u.id = ul."userId" AND ul.label = 'customer'
			WHERE o.status = 'paid' AND o."fundsSource" != 'FREE_CREDITS' AND ul."userId" IS NULL 
		`;
	if (!customers || customers.length === 0) {
		return;
	}
	await prisma.userLabel.createMany({
		data: customers.map(({ id: userId }) => ({
			userId,
			label: 'customer',
		})),
		skipDuplicates: true,
	});
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).argv;
	run(args);
}
