import './script-setup';
import prisma, { tokenClaimIncludes } from '../src/lib/prismadb';
import { getTokenClaimAmount } from '../src/lib/token-claim';
import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import { dispatchNotification } from '../src/lib/notifications';

export default async function run({ real = false }: { real: boolean }) {
	const tokenClaims = await prisma.userTokenClaim.findMany({
		where: {
			createdAt: {
				lt: new Date('2023-11-11 17:00:00.000'),
			},
		},
		include: tokenClaimIncludes,
	});
	console.log(
		`Found ${tokenClaims.length} token claims. Sending notifications...`
	);
	for (const tokenClaim of tokenClaims) {
		const tokenAmountNumber = getTokenClaimAmount(tokenClaim);
		const tokenAmount = new Intl.NumberFormat('en', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 4,
		}).format(tokenAmountNumber);
		const description = `You won ${tokenAmount} DIFIED. Claim ${
			tokenAmountNumber < 2 ? 'it' : 'them'
		} now!`;
		const path = getPath('tokenClaim', {
			slug: tokenClaim.pool.project.slug,
		});
		await dispatchNotification({
			recipientId: tokenClaim.userId,
			type: 'marketing_general',
			content: {
				description,
				path,
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
