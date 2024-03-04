import './script-setup';
import { transferFreeCredits } from '../src/lib/payment';
import { getUser } from '../src/lib/auth';
import { getSellerUser } from '../src/lib/user';
import { getPaymentContextForUser } from '../src/lib/payment/client';
import creditWallet from './credit-wallet';

export default async function run({
	userId,
	amount,
	tag,
	allowDuplicates,
}: {
	userId: string;
	amount: number;
	tag: string;
	allowDuplicates: boolean;
}) {
	const propcoUser = await getSellerUser();
	const { useSandbox } = getPaymentContextForUser(propcoUser);
	if (useSandbox) {
		// ensure propco has the money in its wallet in sandbox mode
		await creditWallet({
			userId: propcoUser.id,
			amount,
			useSandbox: true,
			paymentType: 'CARD',
		});
	}
	const user = await getUser(userId);
	const transfer = await transferFreeCredits(
		user,
		amount,
		tag,
		undefined,
		allowDuplicates
	);
	console.log(transfer);
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('userId', {
			type: 'string',
			description: 'User Id to set the label to',
		})
		.option('amount', {
			type: 'number',
			description: 'Amount of credits to transfer to the user',
			default: 10,
		})
		.option('tag', {
			type: 'string',
			description: 'Tag added to the transfer object',
			default: 'Free credits given from the cli',
		})
		.option('allowDuplicates', {
			type: 'boolean',
			description:
				'Allow duplicate payments for the same user -> user pair',
			default: false,
		})
		.usage(
			`
			$0 --userId <userId> --amount <amount of credits in eur> --tag "<add special tag to this credit transfer>
			
			For sending free credits to sandboxed users, propco user needs to be sandboxed (settings = {"paymentSandbox": true}).
			This should only be ever be done in a development env
			`
		)
		.help().argv;
	run(args);
}
