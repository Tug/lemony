import './script-setup';
import { canReassignUserWallet } from '../src/pages/api/wallet/add-magic-wallet';

export default async function run({
	userId,
	address,
}: {
	userId: string;
	address: string;
}) {
	if (!(await canReassignUserWallet(address, userId))) {
		console.error(
			'Cannot reassign user wallet, current user linked to this wallet has orders or credits'
		);
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('userId', {
			type: 'string',
			description: 'User Id to set the label to',
		})
		.option('address', {
			type: 'string',
			description: 'User Id to set the label to',
		}).argv;
	run(args);
}
