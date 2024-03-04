import { Mango } from './client';
import prisma, { LegalRepresentativeUser } from '../prismadb';
import { Role } from '@prisma/client';
import { dbAddressToMangopayAddress, getSystemUser } from './utils';

export async function ensureBankAccount(user: LegalRepresentativeUser) {
	if (user.role !== Role.SELLER) {
		throw new Error('Only seller accounts can have a bank account');
	}
	if (!user.company) {
		throw new Error(
			'Seller account misconfigured. No company associated with it'
		);
	}
	if (user.company.mangopayBankAccountId) {
		return;
	}
	if (!user.company.address) {
		throw new Error(
			'Seller account misconfigured. Company does not have an address'
		);
	}
	if (!user.company.iban) {
		throw new Error(
			'Seller account misconfigured. Company IBAN incomplete'
		);
	}
	if (!user.company.bic) {
		throw new Error(
			'Seller account misconfigured. Company IBAN/BIC incomplete'
		);
	}
	const mangoClient = Mango.getDefaultClient();
	const systemOwner = await getSystemUser('OWNER');
	const bankAccount = await mangoClient.Users.createBankAccount(
		systemOwner.mangopayId,
		new mangoClient.models.BankAccountDetailsIBAN({
			Type: 'IBAN',
			OwnerName: user.company.name,
			OwnerAddress: dbAddressToMangopayAddress(
				mangoClient,
				user.company.address
			),
			IBAN: user.company.iban.replace(/\s/g, ''),
			BIC: user.company.bic.trim(),
			Tag: `Bank account for seller ${user.email}`,
		})
	);
	await prisma.company.update({
		where: { id: user.company.id },
		data: {
			mangopayBankAccountId: bankAccount.Id,
		},
	});
	user.company.mangopayBankAccountId = bankAccount.Id;
}
