import './script-setup';
import { prisma } from '../src/lib/prismadb';

import { initNotificationPreferences } from '../src/lib/notifications';

export default async function run({}: {}) {
	const users = await prisma.user.findMany({
		where: {
			disabled: false,
			notificationPreferences: {
				none: {},
			},
		},
		select: {
			id: true,
		},
	});
	for (const user of users) {
		console.log(
			'Initializing notification preferences for user ' + user.id
		);
		await initNotificationPreferences(user.id);
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).argv;
	run(args);
}
