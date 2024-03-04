import './script-setup';
import prisma, {
	Prisma,
	SchemaTypes,
	tokenClaimIncludes,
} from '../src/lib/prismadb';
import {
	dispatchNotification,
	sendForTranslation,
	sendPendingNotifications,
} from '../src/lib/notifications';
import {
	getTokenClaimAmount,
	giveRandomTokenClaim,
} from '../src/lib/token-claim';
import { eurToDIFIED } from '@diversifiedfinance/app/components/checkout/currency-utils';
import { printMoney } from '@diversifiedfinance/app/lib/money';
import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import { addUserLabel } from '../src/lib/user';

export default async function run({}: {}) {
	// const usersForTranslations = await prisma.user.findMany({
	// 	where: {
	// 		creditsEur: {
	// 			gt: 0,
	// 		},
	// 	},
	// 	distinct: ['creditsEur'],
	// });
	// console.dir(
	// 	usersForTranslations.map((u) => [
	// 		u.creditsEur.toNumber(),
	// 		eurToDIFIED(u.creditsEur.toNumber()),
	// 	]),
	// 	{ maxArrayLength: null }
	// );
	// for (const user of usersForTranslations) {
	// 	const tokenClaimAmount = eurToDIFIED(user.creditsEur.toNumber());
	// 	await sendForTranslation({
	// 		recipientId: user.id,
	// 		type: 'marketing_general',
	// 		content: {
	// 			title: `${tokenClaimAmount} DIFIED received`,
	// 			description: `Your ${printMoney(
	// 				user.creditsEur.toNumber()
	// 			)} free credits have been converted to ${tokenClaimAmount} DIFIED.`,
	// 			// ignore path for translation
	// 		},
	// 	});
	// }
	// return;
	const users = await prisma.user.findMany({
		where: {
			creditsEur: {
				gt: 0,
			},
		},
	});
	console.log(
		`Converting credits to token claims for ${users.length} user(s)...`
	);
	// wait 3s in case we change our mind
	await new Promise((resolve) => setTimeout(resolve, 3000));
	for (const user of users) {
		console.log('Converting credits to token claims for user', user.id);
		const tokenClaim = await prisma.$transaction(async (tx) => {
			const claim = await giveRandomTokenClaim(
				user,
				eurToDIFIED(user.creditsEur.toNumber()),
				tx
			);
			await tx.user.update({
				where: {
					id: user.id,
				},
				data: {
					creditsEur: 0,
				},
			});
			await addUserLabel(
				user,
				'free-credits-converted-to-token-claim',
				tx
			);
			return claim;
		});
		const tokenClaimAmount = getTokenClaimAmount(tokenClaim);
		const notification = {
			recipientId: user.id,
			type: 'marketing_general',
			content: {
				title: `${tokenClaimAmount} DIFIED received`,
				description: `Your ${printMoney(
					user.creditsEur.toNumber()
				)} free credits have been converted to ${tokenClaimAmount} DIFIED.`,
				path: getPath('tokenClaim', {
					slug: tokenClaim.pool.project.slug,
				}),
			},
		};
		await dispatchNotification(notification, { translate: false });
	}
	await sendPendingNotifications();
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).argv;
	run(args);
}
