import './script-setup';
import * as sumsub from '../src/lib/kyc-providers/sumsub';
import { getUser } from '../src/lib/auth';

export default async function run({ userId }: { userId: string }) {
	const user = await getUser(userId);
	if (!user) {
		throw new Error('User not found');
	}
	if (!user.sumsubId) {
		throw new Error('User has no sumsub applicant attached');
	}
	await sumsub.resetApplicant(user.sumsubId);
	console.log('OK');
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).option('userId', {
		type: 'string',
		description: 'User Id to set the label to',
	}).argv;
	run(args);
}
