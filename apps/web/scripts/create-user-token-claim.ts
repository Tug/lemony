import './script-setup';
import {
	createTokenClaim,
	giveRandomTokenClaim,
	postCreateTokenClaim,
} from '../src/lib/token-claim';
import { transactionExtendable } from '../src/lib/prismadb';
import { getUser } from '../src/lib/auth';

export default async function run({
	poolId,
	userId,
	quantityInDecimal = 1000,
	amount = 1,
	reason,
}: {
	poolId: string;
	userId: string;
	quantityInDecimal?: number;
	amount?: number;
	reason?: string;
}) {
	let claim;
	if (poolId) {
		claim = await createTokenClaim(userId, quantityInDecimal, poolId);
	} else {
		claim = await giveRandomTokenClaim(await getUser(userId), amount);
		// const claims = await Promise.all([
		// 	giveRandomTokenClaim({ id: userId }, amount),
		// 	giveRandomTokenClaim({ id: userId }, amount),
		// 	giveRandomTokenClaim({ id: userId }, amount),
		// ]);
		// console.log('claims', claims);
	}

	if (reason) {
		await postCreateTokenClaim(claim, reason);
	}
	console.log('claim', claim);
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('poolId', {
			type: 'string',
			description: 'Pool Id to get the free token from',
		})
		.option('userId', {
			type: 'string',
			description: 'User Id who will own the token pool',
		})
		.option('quantityInDecimal', {
			type: 'number',
			description: 'quantity in decimal of tokens to give to the user',
		})
		.option('amount', {
			type: 'number',
			description: 'quantity of tokens to give to the user',
		})
		.option('reason', {
			type: 'string',
			description: 'reason for the token claim',
		})
		.demandOption(['userId']).argv;
	run(args);
}
