import './script-setup';
import prisma from '../src/lib/prismadb';

const isEmail = (str: string) => str.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g);

export default async function run({
	orderId,
	newUser,
}: {
	orderId: string;
	newUser: string;
}) {
	let newUserId = newUser;
	if (isEmail(newUser)) {
		const user = await prisma.user.findFirstOrThrow({
			where: {
				email: newUser,
				NOT: { emailVerified: null },
			},
			select: {
				id: true,
			},
		});
		newUserId = user.id;
	}
	if (!newUserId) {
		throw new Error('Invalid param newUserId');
	}
	await prisma.order.update({
		where: {
			id: orderId,
		},
		data: {
			userId: newUserId,
		},
	});
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('orderId', {
			type: 'string',
			description: 'Id of the order',
		})
		.option('newUser', {
			type: 'string',
			description:
				'User Id or Email of the new user that will own the order',
			default: 'propco@diversified.fi',
		}).argv;
	run(args);
}
