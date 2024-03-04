import './script-setup';
import prisma from '../src/lib/prismadb';
import { expoClient } from '../src/lib/notifications';

export default async function run({
	userId,
	notificationId,
}: {
	userId: string;
	notificationId: string;
}) {
	const notification = await prisma.notification.findFirst({
		where: {
			...(notificationId && { id: notificationId }),
			...(userId && {
				recipient: {
					id: userId,
				},
			}),
		},
		orderBy: { visibleAt: 'desc' },
	});
	console.log(notification);
	const receipts = await expoClient.getPushNotificationReceiptsAsync([
		notification.receiptId,
	]);
	console.log(receipts);
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('userId', {
			type: 'string',
			description: 'Id of the user',
		})
		.option('notificationId', {
			type: 'string',
			description: 'Notification id',
		}).argv;
	run(args);
}
