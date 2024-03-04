import './script-setup';
import { hideBin } from 'yargs/helpers';
import { syncAllOrders, syncAllProjects } from '../src/lib/sync/klaviyo';

export default async function run({}: {}) {
	//await syncAllProjects();
	await syncAllOrders();
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).argv;
	run(args);
}
