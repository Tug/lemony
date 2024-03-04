import prisma, { SchemaTypes, UserWithWallets } from '../prismadb';
import { getPaymentContextForUser, Mangopay, Mango } from './client';
import { dbUserToMangopayUserNatural, getSystemUser } from './utils';
import { checkUserPendingBenefits } from '../benefits';
import { syncApplicantDataWithUser } from '../user';

export const syncUser = async (
	user: UserWithWallets,
	settingsOverride?: any
) => {
	await syncApplicantDataWithUser(user);
	await ensureEurWallet(user, settingsOverride);
	await checkUserPendingBenefits(user);
};

export async function ensureEurWallet(
	user: UserWithWallets,
	settingsOverride?: any
) {
	let mangopayUser;
	const {
		mangoClient,
		mangopayUserId,
		mangopayUserIdKey,
		useSandbox,
		mangopayWalletId,
		mangopayWalletIdKey,
	} = getPaymentContextForUser(user, settingsOverride);
	const mangopayUserData = dbUserToMangopayUserNatural(
		mangoClient,
		user,
		settingsOverride
	);
	if (!mangopayUserId) {
		mangopayUser = await mangoClient.Users.create(mangopayUserData);
		await prisma.user.update({
			where: { id: user.id },
			data: {
				[mangopayUserIdKey]: mangopayUser.Id,
			},
		});
		user[mangopayUserIdKey] = mangopayUser.Id;
	} else {
		// TODO: update if changed only
		mangopayUser = await mangoClient.Users.update(mangopayUserData);
	}
	const userType = settingsOverride?.userType ?? 'PAYER';
	const systemUser = await getSystemUser(userType, { useSandbox });
	if (!mangopayWalletId) {
		const eurWallet = await mangoClient.Wallets.create(
			new mangoClient.models.Wallet({
				Owners: [systemUser.mangopayId],
				Description:
					`System wallet ${user.id} - ${userType} for ${user.firstName} ${user.lastName}`.substring(
						0,
						255
					),
				Currency: 'EUR',
				Tag: 'Created from App',
			})
		);

		// error in mangopay lib: https://github.com/Mangopay/mangopay2-nodejs-sdk/issues/351
		// @ts-ignore
		const bankingAliases: Mangopay.bankingAlias.IBANBankingAliasData[] =
			// @ts-ignore
			await mangoClient.BankingAliases.getAll(eurWallet.Id);
		// Banking alias creation is disabled on sandbox
		// Error from mangopay: This endpoint is not available for your account
		if (!bankingAliases?.[0] && !useSandbox) {
			await mangoClient.BankingAliases.create(
				new mangoClient.models.BankingAliasIBAN({
					CreditedUserId: systemUser.mangopayId,
					WalletId: eurWallet.Id,
					OwnerName: `${user.firstName} ${user.lastName}`.trim(),
					Country: 'FR',
				})
			);
		}

		await prisma.user.update({
			where: { id: user.id },
			data: {
				[mangopayWalletIdKey]: eurWallet.Id,
			},
		});
		user[mangopayWalletIdKey] = eurWallet.Id;
	}
}

export async function ensureFreeCreditsWallet(user: UserWithWallets) {
	const {
		mangoClient,
		useSandbox,
		mangopayCreditsWalletId,
		mangopayCreditsWalletIdKey,
	} = getPaymentContextForUser(user);
	if (!mangopayCreditsWalletId) {
		const systemUser = await getSystemUser('PAYER', { useSandbox });
		const eurWallet = await mangoClient.Wallets.create(
			new mangoClient.models.Wallet({
				Owners: [systemUser.mangopayId],
				Description:
					`System wallet ${user.id} - FREE Credits for ${user.firstName} ${user.lastName}`.substring(
						0,
						255
					),
				Currency: 'EUR',
				Tag: 'Created from App',
			})
		);
		await prisma.user.update({
			where: { id: user.id },
			data: {
				[mangopayCreditsWalletIdKey]: eurWallet.Id,
			},
		});
		user[mangopayCreditsWalletIdKey] = eurWallet.Id;
	}
}

export async function ensureProjectWallet(
	project: SchemaTypes.Project,
	{ useSandbox = false }: { useSandbox?: boolean } = {}
) {
	const mangopayWalletIdKey = useSandbox
		? 'sandboxMangopayWalletId'
		: 'mangopayWalletId';
	if (project[mangopayWalletIdKey]) {
		return;
	}
	const mangoClient = Mango.getDefaultClient({ useSandbox });
	const systemUser = await getSystemUser('OWNER', { useSandbox });
	const projectEurWallet = await mangoClient.Wallets.create(
		new mangoClient.models.Wallet({
			Owners: [systemUser.mangopayId],
			Description: `Project wallet for ${project.slug}`.substring(0, 255),
			Currency: 'EUR',
			Tag: 'Created from backend DB Sync',
		})
	);
	await prisma.project.update({
		where: { id: project.id },
		data: {
			[mangopayWalletIdKey]: projectEurWallet.Id,
			...(!useSandbox && {
				mangopayWalletCurrency: projectEurWallet.Currency,
			}),
		},
	});
}
