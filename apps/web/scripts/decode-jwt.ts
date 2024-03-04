import './script-setup';
import { decodeNoLimit } from '../src/lib/decode-token-no-limit';

export default async function run({
	token,
	secret = process.env.NEXTAUTH_SECRET,
}: {
	token: string;
	secret?: string;
}) {
	const decoded = await decodeNoLimit({
		token,
		secret,
	});
	console.log(decoded);
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).option('token', {
		type: 'string',
		description: 'Token to decode',
	}).argv;
	run({ token: args.token ?? args._[0], secret: args.secret });
}
