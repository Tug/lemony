import './script-setup';
import * as mangopayUtils from '../src/lib/payment/utils';
import { Role } from '@prisma/client';
import prisma, {
	legalRepresentativeIncludes,
	LegalRepresentativeUser,
} from '../src/lib/prismadb';
import {
	getPaymentContextForUser,
	Mango,
	Mangopay,
} from '../src/lib/payment/client';
import { ensureEurWallet, syncUser } from '../src/lib/payment/sync';

// const diversifiedSAS = {
// 	name: 'Diversified SAS',
// 	number: '918549692',
// 	email: 'system@diversified.fi',
// 	type: 'BUSINESS',
// 	address: {
// 		addressLine1: '22, rue Ornano',
// 		city: 'Lyon',
// 		region: 'Auvergne-Rhone-Alpes',
// 		postalCode: '69001',
// 		country: {
// 			connect: {
// 				code: 'FR',
// 			},
// 		},
// 	},
// };
//
// const diversifiedSecuritization = {
// 	name: 'Diversified Securitization',
// 	number: 'B274704',
// 	email: 'admin@diversified.fi',
// 	type: 'BUSINESS',
// 	address: {
// 		addressLine1: '20 Rue de Hollerich',
// 		city: 'Luxembourg',
// 		postalCode: '1740',
// 		country: {
// 			connect: {
// 				code: 'LU',
// 			},
// 		},
// 	},
// };

const diversifiedPropCo = {
	name: 'Diversified PropCo',
	number: 'B274627',
	email: 'propco@diversified.fi',
	type: 'BUSINESS',
	address: {
		addressLine1: '20 Rue de Hollerich',
		city: 'Luxembourg',
		postalCode: '1740',
		country: {
			connect: {
				code: 'LU',
			},
		},
	},
	iban: 'LU85 6060 0020 0000 6909',
	bic: 'OLKILUL1XXX',
};

const payerUserData = {
	firstName: 'Vincent',
	lastName: 'Bourdel',
	birthDate: new Date('1988-03-03'),
	email: 'mangopay+payer@diversified.fi',
	role: Role.ADMIN,
	emailVerified: new Date(),
	kycStatus: 'completed',
	kycUpdatedAt: new Date(),
	termsAndConditionsAcceptedAt: new Date(),
	nationality: {
		connect: {
			code: 'FR',
		},
	},
	countryOfResidence: {
		connect: {
			code: 'FR',
		},
	},
	address: {
		addressLine1: '22, rue Ornano',
		city: 'Lyon',
		region: 'Auvergne-Rhone-Alpes',
		postalCode: '69001',
		country: {
			connect: {
				code: 'FR',
			},
		},
	},
	company: diversifiedPropCo,
};

const ownerUserData = {
	firstName: 'Tugdual',
	lastName: 'de Kerviler',
	birthDate: new Date('1987-10-07'),
	email: 'mangopay+owner@diversified.fi',
	role: Role.ADMIN,
	emailVerified: new Date(),
	kycStatus: 'completed',
	kycUpdatedAt: new Date(),
	termsAndConditionsAcceptedAt: new Date(),
	nationality: {
		connect: {
			code: 'LU',
		},
	},
	countryOfResidence: {
		connect: {
			code: 'LU',
		},
	},
	address: {
		addressLine1: '4 rue de la Rainville',
		city: 'Chateaudun',
		postalCode: '28200',
		country: {
			connect: {
				code: 'FR',
			},
		},
	},
	company: diversifiedPropCo,
};

const propcoUserData = {
	firstName: 'Vincent',
	lastName: 'Bourdel',
	birthDate: new Date('1988-03-03'),
	email: 'propco@diversified.fi',
	role: Role.SELLER,
	emailVerified: new Date(),
	kycStatus: 'completed',
	kycUpdatedAt: new Date(),
	termsAndConditionsAcceptedAt: new Date(),
	nationality: {
		connect: {
			code: 'LU',
		},
	},
	countryOfResidence: {
		connect: {
			code: 'LU',
		},
	},
	address: {
		addressLine1: '22, rue Ornano',
		city: 'Lyon',
		region: 'Auvergne-Rhone-Alpes',
		postalCode: '69001',
		country: {
			connect: {
				code: 'FR',
			},
		},
	},
	company: diversifiedPropCo,
};

const mangopayData: Record<string, any> = {
	'mangopay+payer@diversified.fi': {
		category: 'PAYER',
	},
	'mangopay+owner@diversified.fi': {
		category: 'OWNER',
	},
};

export default async function run({
	useSandbox = false,
}: {
	useSandbox?: boolean;
} = {}) {
	for (const userData of [payerUserData, ownerUserData, propcoUserData]) {
		try {
			const existingUser = await prisma.user.findFirst({
				where: { email: userData.email },
			});
			let user: LegalRepresentativeUser;
			if (!existingUser) {
				user = await prisma.user.create({
					data: {
						...userData,
						address: {
							create: userData.address,
						},
						company: {
							connectOrCreate: {
								where: {
									email: userData.company.email,
								},
								create: {
									...userData.company,
									address: {
										create: userData.company.address,
									},
								},
							},
						},
					},
					include: legalRepresentativeIncludes,
				});
				console.log(`${userData.email} user created!`);
			} else {
				user = await prisma.user.update({
					where: { id: existingUser.id },
					data: {
						...userData,
						address: {
							upsert: {
								create: userData.address,
								update: userData.address,
							},
						},
						company: {
							// more important not to duplicate companies
							// than being able to update company info
							connectOrCreate: {
								where: {
									email: userData.company.email,
								},
								create: {
									...userData.company,
									address: {
										create: userData.company.address,
									},
								},
							},
						},
					},
					include: legalRepresentativeIncludes,
				});
				console.log(
					`${userData.email} user updated on ${
						useSandbox ? 'sandbox' : 'prod'
					} environment!`
				);
			}
			const mangoClient = Mango.getDefaultClient({ useSandbox });
			if (!user.email) {
				return;
			}
			if (!mangopayData[user.email]) {
				await ensureEurWallet(user, {
					paymentSandbox: useSandbox,
					userType: 'OWNER',
				});
				console.log(
					`User ${user.email} synced with mangopay on ${
						useSandbox ? 'sandbox' : 'prod'
					} environment!`
				);
				return;
			}
			const mangopayCategory = mangopayData[user.email].category;
			let {
				mangopayUserId,
				mangopayUserIdKey,
				mangopayWalletId,
				mangopayWalletIdKey,
				mangopayCreditsWalletId,
				mangopayCreditsWalletIdKey,
			} = getPaymentContextForUser(user, {
				paymentSandbox: useSandbox,
			});
			if (!mangopayUserId) {
				const mangopayUser = await mangoClient.Users.create(
					mangopayUtils.dbUserToMangopayUserLegal(
						mangoClient,
						user,
						mangopayCategory
					)
				);
				user = await prisma.user.update({
					where: { id: user.id },
					data: {
						[mangopayUserIdKey]: mangopayUser.Id,
					},
					include: legalRepresentativeIncludes,
				});
				user[mangopayUserIdKey] = mangopayUser.Id;
				mangopayUserId = mangopayUser.Id;
				console.log(
					`Mangopay user ${userData.email} created for system on ${
						useSandbox ? 'sandbox' : 'prod'
					} environment!`
				);
			}

			if (!mangopayCreditsWalletId) {
				const eurWallet = await mangoClient.Wallets.create(
					new mangoClient.models.Wallet({
						Owners: [mangopayUserId],
						Description: `Diversified free credits ${mangopayCategory} Euro wallet`,
						Currency: 'EUR',
						Tag: `CREDITS ${mangopayCategory}`,
					})
				);
				user = await prisma.user.update({
					where: { id: user.id },
					data: {
						[mangopayCreditsWalletIdKey]: eurWallet.Id,
					},
					include: legalRepresentativeIncludes,
				});
				user.mangopayCreditsWalletId = eurWallet.Id;
				mangopayCreditsWalletId = eurWallet.Id;
				console.log(
					`Mangopay free credits eur wallet created for main ${mangopayCategory} on ${
						useSandbox ? 'sandbox' : 'prod'
					} environment!`
				);
			} else {
				console.log(
					`Mangopay free credits eur wallet already exists for main ${mangopayCategory} on ${
						useSandbox ? 'sandbox' : 'prod'
					} environment!`
				);
			}

			if (!mangopayWalletId) {
				const eurWallet = await mangoClient.Wallets.create(
					new mangoClient.models.Wallet({
						Owners: [mangopayUserId],
						Description: `Diversified main ${mangopayCategory} Euro wallet`,
						Currency: 'EUR',
						Tag: `MAIN ${mangopayCategory}`,
					})
				);
				user = await prisma.user.update({
					where: { id: user.id },
					data: {
						[mangopayWalletIdKey]: eurWallet.Id,
					},
					include: legalRepresentativeIncludes,
				});
				user.mangopayWalletId = eurWallet.Id;
				mangopayWalletId = eurWallet.Id;
				console.log(
					`Mangopay eur wallet created for main ${mangopayCategory} on ${
						useSandbox ? 'sandbox' : 'prod'
					} environment!`
				);
			} else {
				console.log(
					`Mangopay eur wallet already exists for main ${mangopayCategory} on ${
						useSandbox ? 'sandbox' : 'prod'
					} environment!`
				);
			}

			// only PAYER user can have an IBAN.
			// OWNER user should only do payout and internal transfers
			if (mangopayCategory === 'PAYER') {
				// @ts-ignore
				const bankingAliases: Mangopay.bankingAlias.IBANBankingAliasData[] =
					// @ts-ignore
					await mangoClient.BankingAliases.getAll(mangopayWalletId);
				if (!bankingAliases?.[0]) {
					await mangoClient.BankingAliases.create(
						new mangoClient.models.BankingAliasIBAN({
							CreditedUserId: mangopayUserId,
							WalletId: mangopayWalletId,
							OwnerName: 'Diversified',
							Country: 'LU',
						})
					);
					console.log(
						`Mangopay IBAN created for main PAYER user on ${
							useSandbox ? 'sandbox' : 'prod'
						} environment!`
					);
				} else {
					console.log(
						`Mangopay IBAN already exists for main PAYER user ${
							useSandbox ? 'sandbox' : 'prod'
						} environment!`
					);
				}
			}
		} catch (err) {
			console.error(err);
			// keep going if we encounter an error
		}
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).option('useSandbox', {
		type: 'boolean',
		description: 'Create users and link them to a mangopay sandbox',
	}).argv;
	run(args);
}
