import './script-setup';
import prisma, { Decimal } from '../src/lib/prismadb';

export default async function run({ real = false }: { real: boolean }) {
	const tokenClaims = await prisma.userTokenClaim.findMany({
		include: {
			user: {
				select: {
					labels: true,
				},
			},
		},
	});
	for (const tokenClaim of tokenClaims) {
		console.log('Removing token claim', tokenClaim.id);
		const labels = tokenClaim.user.labels;
		const difiedLabels = labels.filter(({ label }) =>
			label.includes('dified')
		);
		for (const difiedLabel of difiedLabels) {
			try {
				await prisma.userLabel.delete({
					where: {
						id: difiedLabel.id,
					},
				});
			} catch (err) {
				// Skip error, user label is likely already deleted
			}
		}
		await prisma.userTokenClaim.delete({
			where: {
				id: tokenClaim.id,
			},
		});
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).argv;
	run(args);
}
