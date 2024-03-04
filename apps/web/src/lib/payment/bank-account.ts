import { getPaymentContextForUser, Mangopay } from './client';
import { dbAddressToMangopayAddress, getSystemUser } from './utils';
import prisma, { SchemaTypes } from '../prismadb';

export const getUserBankAccount = async (
	userId: string,
	bankAccountId?: string
) => {
	return await prisma.userBankAccount.findFirst({
		where: {
			userId,
			...(bankAccountId && { id: bankAccountId }),
			disabled: false,
		},
	});
};

export async function createBankAccount(
	user: SchemaTypes.User,
	{ iban, bic, label }: { iban: string; bic: string; label?: string },
	{ forceCreate = false }: { forceCreate?: boolean } = {}
) {
	const { mangoClient, mangopayUserId, useSandbox } =
		getPaymentContextForUser(user);
	if (!mangopayUserId) {
		throw new Error('Mangopay account missing');
	}
	const systemUserOwner = await getSystemUser('OWNER', { useSandbox });
	if (!user.address) {
		if (!forceCreate) {
			throw new Error('User is missing an address');
		}
	}
	const address = user.address ?? {
		addressLine1: '22 rue Ornano',
		city: 'Lyon',
		//region: 'Auvergne-Rhône-Alpes',
		postalCode: '69001',
		country: { code: 'FR' },
	};
	const newBankAccount = await mangoClient.Users.createBankAccount(
		systemUserOwner.mangopayId,
		new mangoClient.models.BankAccountDetailsIBAN({
			Type: 'IBAN',
			OwnerAddress: dbAddressToMangopayAddress(mangoClient, address),
			IBAN: iban,
			BIC: bic,
			OwnerName: `${user.firstName} ${user.lastName}`.trim(),
			Tag: label,
		})
	);
	const dbBankAccount = await prisma.userBankAccount.create({
		data: {
			userId: user.id,
			mangopayBankAccountId: newBankAccount.Id,
			label,
		},
	});
	// update user updatedAt so it's synced with external services such as customerio
	await prisma.user.update({
		where: { id: user.id },
		data: { updatedAt: new Date() },
	});
	return dbBankAccount;
}

export async function payout(
	user: SchemaTypes.User,
	{
		amountCent,
		label = 'DIVERSIFIED PAYOUT',
		instant = false,
	}: {
		amountCent: number;
		label?: string;
		instant?: boolean;
	},
	bankAccountId?: string
) {
	const { mangoClient, mangopayUserId, mangopayWalletId, useSandbox } =
		getPaymentContextForUser(user);
	if (!mangopayUserId) {
		throw new Error('Mangopay account missing');
	}
	if (!mangopayWalletId) {
		throw new Error('Mangopay wallet missing');
	}
	const userBankAccount = await getUserBankAccount(user.id, bankAccountId);
	if (!userBankAccount) {
		throw new Error('User bank account missing');
	}
	const systemUserOwner = await getSystemUser('OWNER', { useSandbox });
	return await mangoClient.PayOuts.create({
		PaymentType: 'BANK_WIRE',
		AuthorId: systemUserOwner.mangopayId,
		DebitedFunds: {
			Amount: amountCent,
			Currency: 'EUR',
		},
		Fees: {
			Amount: 0,
			Currency: 'EUR',
		},
		BankAccountId: userBankAccount.mangopayBankAccountId,
		DebitedWalletId: mangopayWalletId,
		BankWireRef: label,
		Tag: `Payout for external user ${user.id}`,
		PayoutModeRequested: instant
			? 'INSTANT_PAYMENT' // "INSTANT_PAYMENT_ONLY"
			: 'STANDARD',
	});
}
