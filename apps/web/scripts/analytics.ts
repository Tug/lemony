import './script-setup';
import prisma from '../src/lib/prismadb';

async function run() {
	const users = await prisma.$queryRaw`
		SELECT
			u.id, u."firstName", u."lastName", u."email", u."phoneNumber",
			u."emailVerified", u."phoneNumberVerified", u."birthDate",
			u.created_at, u.updated_at, u.role, u."kycStatus", u."kycUpdatedAt",
			u."sumsubId", u."mangopayId", u."mangopayWalletId",
			COALESCE(SUM(o.amount), 0) AS "totalAmountSpent",
			COALESCE(COUNT(o.id), 0) AS "ordersCount",
			labels.label_string
		FROM public.users u
		LEFT JOIN public.orders o ON u.id = o."userId"
		LEFT JOIN (
		  SELECT "userId", STRING_AGG(label, ',') AS label_string
		  FROM public.userlabels
		  GROUP BY "userId"
		) labels ON u.id = labels."userId"
		WHERE u.role = 'USER' and u.disabled = FALSE
		GROUP BY u.id, labels.label_string
	`;
	console.log(users);
	const averageAmountSpentRes = await prisma.$queryRaw`
			SELECT AVG(total_amount_spent) AS average_amount_spent
			FROM (
			  SELECT u.id, SUM(o.amount) AS total_amount_spent
			  FROM public.users u
			  LEFT JOIN sandbox.orders o ON u.id = o."userId"
			  GROUP BY u.id
			) subquery;
		`;
	console.log(averageAmountSpentRes);
	const searchString = 'tug';
	const userSearch = await prisma.$queryRaw`
			SELECT
				u.id, u."firstName", u."lastName", u."email", u."phoneNumber",
				u."emailVerified", u."phoneNumberVerified", u."birthDate",
				u.created_at, u.updated_at, u.role, u."kycStatus", u."kycUpdatedAt",
				u."sumsubId", u."mangopayId", u."mangopayWalletId",
				COALESCE(SUM(o.amount), 0) AS "totalAmountSpent",
				COALESCE(COUNT(o.id), 0) AS "ordersCount",
				labels.label_string
			FROM public.users u
			LEFT JOIN public.orders o ON u.id = o."userId"
			LEFT JOIN (
			  SELECT "userId", STRING_AGG(label, ',') AS label_string
			  FROM public.userlabels
			  GROUP BY "userId"
			) labels ON u.id = labels."userId"
			WHERE u.role = 'USER' and u.disabled = FALSE and (
				u.id LIKE ${`%${searchString}%`} OR
				u."firstName" LIKE ${`%${searchString}%`} OR
				u."lastName" LIKE ${`%${searchString}%`} OR
				u.email LIKE ${`%${searchString}%`} OR
				u."phoneNumber" LIKE ${`%${searchString}%`}
			)
			GROUP BY u.id, labels.label_string
		`;
	console.log(userSearch);
}

if (require.main === module) {
	// const yargs = require('yargs/yargs');
	// const { hideBin } = require('yargs/helpers');
	// const args = yargs(hideBin(process.argv)).option('useSandbox', {
	// 	type: 'boolean',
	// 	description: 'Create users and link them to a mangopay sandbox',
	// }).argv;
	run();
}
