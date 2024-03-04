import './script-setup';
import prisma from '../src/lib/prismadb';

export default async function run({
	userId,
	fakeRun = false,
}: {
	userId?: string;
	fakeRun: boolean;
}) {
	const allUsers = await prisma.user.findMany({
		where: {
			...(userId && { id: userId }),
			role: 'USER',
			OR: [
				{
					kycStatus: { not: 'completed' },
				},
				{
					kycStatus: null,
				},
			],
		},
		select: {
			id: true,
			settings: true,
			locale: true,
			countryOfResidence: true,
		},
	});
	if (allUsers.length === 0) {
		console.log('No user found.');
	} else {
		console.log(`${allUsers.length} user(s) found.`);
	}
	// console.dir(
	// 	new Set(allUsers.map((user) => user.countryOfResidence?.code)),
	// 	{ maxArrayLength: null }
	// );
	// return;
	for (const userRow of allUsers) {
		let locale = null;
		if (userRow.settings?.preferences?.locale) {
			locale = userRow.settings?.preferences?.locale;
		} else if (userRow.locale !== 'en') {
			continue;
		} else {
			locale = ['FR', 'BE'].includes(userRow.countryOfResidence?.code)
				? 'fr'
				: 'en';
		}
		if (locale) {
			console.log(`Assigning locale ${locale} to user ${userRow.id}`);
			if (!fakeRun) {
				await prisma.user.update({
					where: { id: userRow.id },
					data: { locale },
				});
			}
		}
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('userId', {
			type: 'string',
			description: 'Only check benefits for this user',
		})
		.option('fakeRun', {
			type: 'boolean',
			description: "Don't apply for real",
		}).argv;
	run(args);
}
