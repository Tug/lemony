import './script-setup';
import { hideBin } from 'yargs/helpers';
import { syncLastUpdatedProfiles } from '../src/lib/sync/klaviyo';

export default async function run({
	force,
	verbose,
}: {
	force: boolean;
	verbose: boolean;
}) {
	try {
		while (true) {
			const syncCount = await syncLastUpdatedProfiles({
				count: force ? 10000 : 300,
				force,
				verbose,
			});
			if (syncCount === 0 || force) {
				break;
			}
			console.log(`Synced ${syncCount} users with Klaviyo`);
			await new Promise((resolve) => setTimeout(resolve, 10000));
		}
	} catch (err) {
		console.error(`Error syncing projects:`, err);
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('verbose', {
			alias: 'v',
			type: 'boolean',
			description: 'Verbose mode',
		})
		.option('force', {
			type: 'boolean',
			description: 'Force sync everyone',
		}).argv;
	run(args);
}
