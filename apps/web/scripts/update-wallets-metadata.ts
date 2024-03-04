import './script-setup';
import { magic } from '../src/lib/magic-admin';
import prisma from '../src/lib/prismadb';

export default async function run({
	lastDays = undefined,
}: {
	lastDays?: number;
}) {
	const startDate = new Date();
	if (lastDays > 0) {
		startDate.setDate(new Date().getDate() - lastDays);
	}
	const wallets = await prisma.wallet.findMany({
		where: {
			...(lastDays && {
				owner: {
					createdAt: {
						gte: startDate,
					},
				},
			}),
		},
	});
	for (const wallet of wallets) {
		const metadata = await magic.users.getMetadataByPublicAddress(
			wallet.address
		);
		await prisma.wallet.update({
			where: {
				id: wallet.id,
			},
			data: {
				metadata: {
					...wallet.metadata,
					...metadata,
				},
			},
		});
		console.log('Updated metadata for ', wallet.address);
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).option('lastDays', {
		type: 'number',
		description: 'Number of days to look',
	}).argv;
	run(args);
}
