import './script-setup';
import { hideBin } from 'yargs/helpers';
import { syncAllOrders, syncAllUsers } from '../src/lib/sync/amplitude';

export default async function run({}: {}) {
	// await syncAllUsers();
	await syncAllOrders();
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).argv;
	run(args);
}
