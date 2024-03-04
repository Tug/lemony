import { fetchFeatures } from '../src/lib/features';

Error.stackTraceLimit = Infinity;
import './script-setup';
import { syncUser } from '../src/lib/payment/sync';
import { getUser } from '../src/lib/auth';
import { checkUserPendingBenefits } from '../src/lib/benefits';
import prisma from '../src/lib/prismadb';

export default async function run({
	userId,
	fakeRun = false,
	syncFirst = false,
	useSandbox = true,
}: {
	userId?: string;
	fakeRun?: boolean;
	syncFirst?: boolean;
	useSandbox?: boolean;
}) {
	const allUsers = await prisma.user.findMany({
		where: {
			...(userId && { id: userId }),
			role: 'USER',
			...(!syncFirst && { NOT: { mangopayWalletId: null } }),
		},
		select: { id: true },
	});
	if (allUsers.length === 0) {
		console.log('No user found.');
	} else {
		console.log(`${allUsers.length} user(s) found.`);
	}
	for (const userRow of allUsers) {
		const user = await getUser(userRow.id);
		if (syncFirst) {
			console.log('Syncing user and checking benefits', user.id);
			await syncUser(user, { useSandbox });
		} else {
			console.log('Checking user benefits', user.id);
			try {
				const benefitsApplied = await checkUserPendingBenefits(
					user,
					fakeRun
				);
				if (benefitsApplied && benefitsApplied.length > 0) {
					console.log(
						`Applied ${benefitsApplied.length} benefits to user: `,
						benefitsApplied.join(', ')
					);
				}
			} catch (err) {
				console.error(err);
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
