import './script-setup';
import { getUser } from '../src/lib/auth';
import { addUserLabel } from '../src/lib/user';

export default async function run({
	userId,
	label,
}: {
	userId: string;
	label: string;
}) {
	const user = await getUser(userId);
	await addUserLabel(user, label);
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('userId', {
			type: 'string',
			description: 'User Id to set the label to',
		})
		.option('label', {
			type: 'string',
			description: 'User Id to set the label to',
			default: 'vip1',
		}).argv;
	run(args);
}
