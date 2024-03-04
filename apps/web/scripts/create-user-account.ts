import './script-setup';
import { addUserLabel, upsertUser } from '../src/lib/user';
import prisma from '../src/lib/prismadb';
import generateReferralLink from './generate-referral-link-for-user';
import { syncUser } from '../src/lib/payment/sync';

export default async function run({
	email,
	locale,
	referralCode,
	labels: labelsString,
	kycStatus,
}: {
	email: string;
	referralCode: string;
	locale: string;
	labels?: string;
	kycStatus?: string;
}) {
	const labels = labelsString?.split(',') ?? [];
	const existingUser = await prisma.user.findFirst({
		where: { email, NOT: { emailVerified: null } },
	});
	if (existingUser) {
		throw new Error(`User ${email} already exists`);
	}
	const { user } = await upsertUser({ email });
	await prisma.user.update({
		where: { id: user.id },
		data: {
			locale,
			...(kycStatus && { kycStatus, kycUpdatedAt: new Date() }),
		},
	});
	for (const label of labels) {
		await addUserLabel(user, label);
	}
	// sync will fail since user has not accepted terms
	//await syncUser(user);
	await generateReferralLink({ userId: user.id, lang: locale, referralCode });
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('email', {
			type: 'string',
			description: 'Email',
		})
		.option('locale', {
			type: 'string',
			description: 'User locale',
			default: 'fr',
		})
		.option('referralCode', {
			type: 'string',
			description: 'Custom referral code',
		})
		.option('labels', {
			type: 'string',
			description: 'quantity in decimal of tokens to give to the user',
		})
		.option('kycStatus', {
			type: 'string',
			description: 'KYC status of the user',
			default: 'completed',
		})
		.demandOption(['email']).argv;
	run(args);
}
