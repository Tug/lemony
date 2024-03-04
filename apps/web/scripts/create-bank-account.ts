import './script-setup';
import prisma, { legalRepresentativeIncludes } from '../src/lib/prismadb';
import { ensureBankAccount } from '../src/lib/payment/seller';

export default async function run() {
	const user = await prisma.user.findFirstOrThrow({
		where: {
			email: 'propco@diversified.fi',
			NOT: { emailVerified: null },
		},
		include: legalRepresentativeIncludes,
	});
	await ensureBankAccount(user);
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).argv;
	run(args);
}
