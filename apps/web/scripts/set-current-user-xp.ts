import './script-setup';
import { prisma } from '../src/lib/prismadb';

import { setInitialUserXP } from '../src/lib/user';

export default async function run({ userId }: { userId?: string }) {
	const users = await prisma.user.findMany({
		where: {
			...(userId && { id: userId }),
		},
		select: {
			id: true,
		},
	});
	for (const user of users) {
		console.log('Setting XP for user ' + user.id);
		await setInitialUserXP(user);
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).option('userId', {
		type: 'string',
		description: 'Only set xp for this user',
	}).argv;
	run(args);
}
