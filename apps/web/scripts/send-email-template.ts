import './script-setup';
import { sendEmailToUserWithTemplate } from '../src/lib/emails/sendgrid';
import { getUser } from '../src/lib/auth';
import { getAnonymizedName } from '../src/lib/user';
import { printMoney } from '@diversifiedfinance/app/lib/money';

export default async function run({
	userId,
	template,
}: {
	userId: string;
	template: string;
}) {
	let customVars = {};
	const user = await getUser(userId);
	if (
		template === 'FREE_CREDITS_RECEIVED_SPONSOR' ||
		template === 'FREE_CREDITS_RECEIVED_REFERRAL'
	) {
		const receiver = await getUser(userId);
		const resourceUserName = await getAnonymizedName(userId, false);
		customVars = {
			amount: printMoney(10, 'EUR', {
				language: receiver.locale ?? 'en',
			}),
			credits_amount: receiver.creditsEur,
			anonymized_name: resourceUserName,
		};
	}
	await sendEmailToUserWithTemplate({
		user,
		template,
		customVars,
	});
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('userId', {
			type: 'string',
			description: 'Id of the user',
		})
		.option('template', {
			type: 'string',
			description: 'Template Id',
		}).argv;
	run(args);
}
