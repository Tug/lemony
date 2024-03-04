jest.mock('../../lib/emails/sendgrid');
import prisma from '../../lib/prismadb';
import { upsertUserFromWallet } from '../../lib/user';

const cleanup = async () => {
	const deleteUsers = prisma.user.deleteMany({ where: { role: 'USER' } });
	const deleteWallets = prisma.wallet.deleteMany();
	const deleteAccounts = prisma.account.deleteMany();

	await prisma.$transaction([deleteUsers, deleteWallets, deleteAccounts]);
};

beforeAll(async () => {
	await cleanup();
});

afterAll(async () => {
	await cleanup();
	await prisma.$disconnect();
});

describe('upsertUserFromWallet', () => {
	it('should create new user from just a single wallet address', async () => {
		const wallet = {
			address: '0x04812d7e3a9829e5d51bdd64ceb35dfa',
		};

		await expect(upsertUserFromWallet(wallet)).resolves.toEqual(
			expect.objectContaining({
				isNew: true,
				user: expect.objectContaining({
					id: expect.any(String),
					email: null,
					emailVerified: null,
					role: 'USER',
					disabled: false,
					privacyPolicyAcceptedAt: null,
					termsAndConditionsAcceptedAt: null,
					createdAt: expect.any(Date),
					updatedAt: expect.any(Date),
					wallets: [
						expect.objectContaining({
							address: '0x04812d7e3a9829e5d51bdd64ceb35dfa',
							id: expect.any(String),
							isPrimary: true,
							ownerId: expect.any(String),
							metadata: expect.objectContaining({
								is_apple: false,
								is_email: false,
								is_google: false,
								is_phone: false,
							}),
						}),
					],
				}),
			})
		);
	});

	it('should create new user from a wallet address with extra user info', async () => {
		const wallet = {
			address: '0x05812d7e3a9829e5d51bdd64ceb35dfb',
		};
		const userData = {
			email: 'john@doe.net',
		};
		const accountData = {
			provider: 'magic',
			providerAccountId: '444444',
		};

		await expect(
			upsertUserFromWallet(wallet, userData, accountData)
		).resolves.toEqual(
			expect.objectContaining({
				isNew: true,
				user: expect.objectContaining({
					id: expect.any(String),
					role: 'USER',
					email: 'john@doe.net',
					emailVerified: expect.any(Date),
					disabled: false,
					privacyPolicyAcceptedAt: null,
					termsAndConditionsAcceptedAt: null,
					createdAt: expect.any(Date),
					updatedAt: expect.any(Date),
					wallets: [
						expect.objectContaining({
							address: '0x05812d7e3a9829e5d51bdd64ceb35dfb',
							id: expect.any(String),
							isPrimary: true,
							ownerId: expect.any(String),
							metadata: expect.objectContaining({
								is_apple: false,
								is_email: true,
								is_google: false,
								is_phone: false,
							}),
						}),
					],
				}),
			})
		);
	});

	it('should link a new wallet to an existing user', async () => {
		const wallet = {
			address: '0x06812d7e3a9829e5d51bdd64ceb35dfc',
		};
		const userData = {
			email: 'foo@bar.net',
			emailVerified: new Date(),
		};
		await prisma.user.create({ data: userData });

		await expect(
			upsertUserFromWallet(wallet, { email: userData.email })
		).resolves.toEqual(
			expect.objectContaining({
				isNew: false,
				user: expect.objectContaining({
					id: expect.any(String),
					role: 'USER',
					email: 'foo@bar.net',
					emailVerified: expect.any(Date),
					disabled: false,
					privacyPolicyAcceptedAt: null,
					termsAndConditionsAcceptedAt: null,
					createdAt: expect.any(Date),
					updatedAt: expect.any(Date),
					wallets: [
						expect.objectContaining({
							address: '0x06812d7e3a9829e5d51bdd64ceb35dfc',
							id: expect.any(String),
							isPrimary: true,
							ownerId: expect.any(String),
							metadata: expect.objectContaining({
								is_apple: false,
								is_email: true,
								is_google: false,
								is_phone: false,
							}),
						}),
					],
				}),
			})
		);
	});

	it('should link an existing wallet to an existing user', async () => {
		const wallet = {
			address: '0x07812d7e3a9829e5d51bdd64ceb35dfd',
		};
		const existingWallet = await prisma.wallet.create({ data: wallet });
		const userData = {
			email: 'fizz@buzz.com',
			emailVerified: new Date(),
		};
		await prisma.user.create({ data: userData });

		await expect(
			upsertUserFromWallet(wallet, { email: userData.email })
		).resolves.toEqual(
			expect.objectContaining({
				isNew: false,
				user: expect.objectContaining({
					id: expect.any(String),
					email: 'fizz@buzz.com',
					emailVerified: expect.any(Date),
					role: 'USER',
					disabled: false,
					privacyPolicyAcceptedAt: null,
					termsAndConditionsAcceptedAt: null,
					createdAt: expect.any(Date),
					updatedAt: expect.any(Date),
					wallets: [
						{
							...existingWallet,
							isPrimary: true,
							ownerId: expect.any(String),
							metadata: expect.objectContaining({
								is_apple: false,
								is_email: true,
								is_google: false,
								is_phone: false,
							}),
						},
					],
				}),
			})
		);
	});

	it('should update the user data on login', async () => {
		const wallet = {
			address: '0x08812d7e3a9829e5d51bdd64ceb35dfe',
		};
		const userData = {
			email: 'fizzzz@buzzzzz.com',
		};
		const existingWallet = await prisma.wallet.create({
			data: {
				...wallet,
				owner: {
					create: {
						phoneNumber: '0123456789',
						phoneNumberVerified: new Date(),
					},
				},
			},
		});

		await expect(upsertUserFromWallet(wallet, userData)).resolves.toEqual(
			expect.objectContaining({
				isNew: false,
				user: expect.objectContaining({
					id: existingWallet.ownerId,
					email: 'fizzzz@buzzzzz.com',
					emailVerified: expect.any(Date),
					phoneNumber: '0123456789',
					phoneNumberVerified: expect.any(Date),
					role: 'USER',
					disabled: false,
					privacyPolicyAcceptedAt: null,
					termsAndConditionsAcceptedAt: null,
					createdAt: expect.any(Date),
					updatedAt: expect.any(Date),
					wallets: [
						{
							...existingWallet,
							isPrimary: true,
							ownerId: expect.any(String),
							metadata: expect.objectContaining({
								is_apple: false,
								is_email: true,
								is_google: false,
								is_phone: false,
							}),
						},
					],
				}),
			})
		);
	});

	it('should not update the user data that is already defined on login', async () => {
		const wallet = {
			address: '0x09812d7e3a9829e5d51bdd64ceb35dff',
		};
		const userData = {
			email: 'fizzzz@buzzzzz.com',
		};
		const existingWallet = await prisma.wallet.create({
			data: {
				...wallet,
				owner: {
					create: {
						email: 'notfiz@notbuzz.com',
						emailVerified: null,
					},
				},
			},
		});

		await expect(upsertUserFromWallet(wallet, userData)).resolves.toEqual(
			expect.objectContaining({
				isNew: false,
				user: expect.objectContaining({
					id: existingWallet.ownerId,
					email: 'notfiz@notbuzz.com',
					emailVerified: null,
					role: 'USER',
					disabled: false,
					privacyPolicyAcceptedAt: null,
					termsAndConditionsAcceptedAt: null,
					createdAt: expect.any(Date),
					updatedAt: expect.any(Date),
					wallets: [
						{
							...existingWallet,
							isPrimary: true,
							ownerId: expect.any(String),
							metadata: expect.objectContaining({
								is_apple: false,
								is_email: true,
								is_google: false,
								is_phone: false,
							}),
						},
					],
				}),
			})
		);
	});

	it("should make other user's wallets secondary", async () => {
		const newWallet = {
			address: '0x10812d7e3a9829e5d51bdd64ceb35dfa',
		};
		const userData = {
			email: 'fizzzzbuzzzzz@fizzzzbuzzzzz.com',
		};
		const existingWallet = await prisma.wallet.create({
			data: {
				address: '0x11812d7e3a9829e5d51bdd64ceb35dfb',
				isPrimary: true,
				owner: {
					create: {
						email: 'fizzzzbuzzzzz@fizzzzbuzzzzz.com',
						emailVerified: new Date(),
					},
				},
			},
		});

		await expect(
			upsertUserFromWallet(newWallet, userData)
		).resolves.toEqual(
			expect.objectContaining({
				isNew: false,
				user: expect.objectContaining({
					id: existingWallet.ownerId,
					email: 'fizzzzbuzzzzz@fizzzzbuzzzzz.com',
					emailVerified: expect.any(Date),
					role: 'USER',
					disabled: false,
					privacyPolicyAcceptedAt: null,
					termsAndConditionsAcceptedAt: null,
					createdAt: expect.any(Date),
					updatedAt: expect.any(Date),
					wallets: [
						{
							...existingWallet,
							isPrimary: false,
							ownerId: expect.any(String),
							metadata: null,
						},
						{
							...newWallet,
							id: expect.any(String),
							isPrimary: true,
							ownerId: expect.any(String),
							metadata: expect.objectContaining({
								is_apple: false,
								is_email: true,
								is_google: false,
								is_phone: false,
							}),
						},
					],
				}),
			})
		);
	});
});
