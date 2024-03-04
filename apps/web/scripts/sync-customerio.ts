import './script-setup';
import { hideBin } from 'yargs/helpers';
import prisma, {
	userWithReferrerIncludes,
	userWithWalletsIncludes,
} from '../src/lib/prismadb';
import {
	syncAllProjects,
	syncCustomerIOProfile,
	syncLastUpdatedProfiles,
} from '../src/lib/sync/customerio';

export default async function run({
	force,
	verbose,
	userId,
	syncProjects,
}: {
	force: boolean;
	verbose: boolean;
	userId?: string;
	syncProjects?: boolean;
}) {
	if (syncProjects) {
		await syncAllProjects();
	}
	if (userId) {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				id: userId,
			},
			include: {
				...userWithWalletsIncludes,
				...userWithReferrerIncludes,
				bankAccounts: {
					select: {
						id: true,
					},
				},
				tokenClaims: {
					select: {
						id: true,
					},
				},
			},
		});
		const hasBankingDetails = Boolean(user.bankAccounts.length > 0);
		const hasTokenClaim = Boolean(user.tokenClaims.length > 0);
		await syncCustomerIOProfile(user, {
			hasBankingDetails,
			hasTokenClaim,
		});
	} else {
		try {
			while (true) {
				const syncCount = await syncLastUpdatedProfiles({
					count: force ? 10000 : 500,
					force,
					verbose,
				});
				if (syncCount === 0 || force) {
					break;
				}
				console.log(`Synced ${syncCount} users with CustomerIO`);
				await new Promise((resolve) => setTimeout(resolve, 10000));
			}
		} catch (err) {
			console.error(`Error syncing projects:`, err);
		}
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('userId', {
			type: 'string',
			description: 'User id to sync',
		})
		.option('syncProjects', {
			type: 'boolean',
			description: 'Sync projects first',
		}).argv;
	run(args);
}
