//jest.mock('../../lib/emails/sendgrid');
import prisma, {
	Decimal,
	projectForCheckoutIncludes,
	userWithWalletsIncludes,
} from '../../lib/prismadb';
import { checkout } from '../../lib/checkout';
import { seller1, user1 } from '../fixtures/user';
import {
	product1,
	productCheap1,
	project1,
	projectCheap1,
} from '../fixtures/project';
import { CheckoutDTO } from '../../dto/checkout';
import { getUser } from '../../lib/auth';
import { ensureEurWallet, ensureProjectWallet } from '../../lib/payment/sync';
import { CheckoutError } from '../../lib/error';
import creditWallet from '../../../scripts/credit-wallet';
import { transferFreeCredits } from '../../lib/payment';
import { getUserOrdersWithPrices } from '../../lib/orders';
import type { I18n } from '@diversifiedfinance/app/lib/i18n';

jest.mock('axios');

const reqContextMock = {
	i18n: {
		t: (key: string) => key,
	} as I18n,
};
const cleanup = async () => {
	// remove in 2 steps because of foreign key constrains
	await prisma.company.deleteMany();
	await prisma.address.deleteMany();
	await prisma.order.deleteMany();
	await prisma.sandboxOrder.deleteMany();
	await prisma.payment.deleteMany();
	await prisma.oracleProduct.deleteMany();
	await prisma.productsInProjects.deleteMany();
	await prisma.productInInventory.deleteMany();
	await prisma.wallet.deleteMany();
	await prisma.account.deleteMany();
	await prisma.userTokenClaim.deleteMany();
	await prisma.sandboxUserTokenClaim.deleteMany();
	await prisma.user.deleteMany({
		where: {
			AND: [
				{ role: { not: 'ADMIN' } },
				{ email: { not: 'propco@diversified.fi' } },
			],
		},
	});
	await prisma.freeTokenPool.deleteMany();
	await prisma.project.deleteMany();
	await prisma.projectCrowdfundingState.deleteMany();
};

const createFixtures = async () => {
	const seller = await prisma.user.create({
		data: seller1,
	});
	const project = await prisma.project.create({
		data: {
			...project1,
			owner: { connect: { id: seller.id } },
			crowdfundingState: {
				create: {
					collectedAmount: 0,
					maximumAmount: project1.targetPrice,
				},
			},
			products: {
				create: [
					{
						product: {
							create: product1,
						},
						quantity: 1,
						unitPrice: project1.targetPrice,
					},
				],
			},
		},
	});
	await ensureProjectWallet(project);
	const projectCheap = await prisma.project.create({
		data: {
			...projectCheap1,
			owner: { connect: { id: seller.id } },
			crowdfundingState: {
				create: {
					collectedAmount: 0,
					maximumAmount: projectCheap1.targetPrice,
				},
			},
			products: {
				create: [
					{
						product: {
							create: productCheap1,
						},
						quantity: 1,
						unitPrice: projectCheap1.targetPrice,
					},
				],
			},
		},
	});
	await ensureProjectWallet(projectCheap);
	const user = await prisma.user.create({
		data: user1,
		include: userWithWalletsIncludes,
	});
	await ensureEurWallet(user);
	await creditWallet({
		amount: 2000,
		useSandbox: false,
		paymentType: 'CARD',
	});
};

beforeAll(async () => {
	await cleanup();
	await createFixtures();
});

afterAll(async () => {
	await cleanup();
	await prisma.$disconnect();
});

describe('checkout', () => {
	it('should fail when user has no money in wallet and no credits', async () => {
		const user = await getUser(user1.id!);
		const project = await prisma.project.findUniqueOrThrow({
			where: { slug: project1.slug },
			include: projectForCheckoutIncludes,
		});
		const checkoutDetails: CheckoutDTO = {
			totalCent: 500 * 100,
			currency: 'EUR',
			projectId: project.id,
			useCredits: false,
		};
		await checkout(user, checkoutDetails, project, reqContextMock)
			.then(() => {
				throw new Error('This block of code should not be reached');
			})
			.catch((error) => {
				expect(error).toEqual(
					new CheckoutError(
						'Error returned from our payment service provider.',
						'PSP_FAILURE'
					)
				);
				expect(error.type).toEqual('PSP_FAILURE');
				expect(error.context).toEqual(
					expect.objectContaining({
						orderId: expect.any(String),
						psp: {
							txId: expect.any(String),
							// Unsufficient => typo from mangopay
							message: 'Unsufficient wallet balance',
							code: '001001',
						},
					})
				);
			});
	});

	it('should fail when user has not enough credits', async () => {
		const user = await getUser(user1.id!);
		await prisma.user.update({
			where: { id: user.id },
			data: {
				creditsEur: 100,
			},
		});

		const project = await prisma.project.findUniqueOrThrow({
			where: { slug: project1.slug },
			include: projectForCheckoutIncludes,
		});
		const checkoutDetails: CheckoutDTO = {
			totalCent: 500 * 100,
			currency: 'EUR',
			projectId: project.id,
			useCredits: true,
		};
		await expect(
			checkout(user, checkoutDetails, project, reqContextMock)
		).rejects.toThrow('Insufficient EUR credits balance');
	});

	it('should pass when user has just enough credits', async () => {
		const user = await getUser(user1.id!);
		// would not work if tests are run in parallel
		const initialCredits = user.creditsEur;
		await transferFreeCredits(
			user,
			500,
			'should pass when user has just enough credits',
			user.id
		);
		const project = await prisma.project.findUniqueOrThrow({
			where: { slug: project1.slug },
			include: projectForCheckoutIncludes,
		});
		const checkoutDetails: CheckoutDTO = {
			totalCent: 500 * 100,
			currency: 'EUR',
			projectId: project.id,
			useCredits: true,
		};
		await expect(
			checkout(user, checkoutDetails, project, reqContextMock)
		).resolves.toMatchObject({
			id: expect.any(String),
			paymentId: expect.any(String),
			amount: new Decimal('500'),
			currency: 'EUR',
			fundsSource: 'FREE_CREDITS',
			paymentStatus: 'SUCCEEDED',
			project: expect.anything(),
			projectId: project.id,
			quantityInDecimal: BigInt('47620'),
			status: 'paid',
			type: 'BUY',
			userId: user.id,
		});
		await expect(getUser(user1.id!)).resolves.toMatchObject({
			creditsEur: initialCredits,
		});
		const orders = await getUserOrdersWithPrices(user1.id!);
		expect(orders).toEqual([
			expect.objectContaining({
				id: expect.any(String),
				paymentId: expect.any(String),
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
				amount: 500,
				currency: 'EUR',
				fundsSource: 'FREE_CREDITS',
				paymentStatus: 'SUCCEEDED',
				project: expect.objectContaining({
					id: project.id,
					prices: {
						latest: undefined,
						latest_price: expect.any(Array),
					},
				}),
				projectId: project.id,
				quantityInDecimal: 47620,
				status: 'paid',
				type: 'BUY',
				userId: user.id,
			}),
		]);
	});

	it('should be able to use money credited on the user wallet', async () => {
		const user = await getUser(user1.id!);
		await creditWallet({
			userId: user.id,
			amount: 500,
			useSandbox: false,
			paymentType: 'CARD',
		});
		const project = await prisma.project.findUniqueOrThrow({
			where: { slug: project1.slug },
			include: projectForCheckoutIncludes,
		});
		const checkoutDetails: CheckoutDTO = {
			totalCent: 500 * 100,
			currency: 'EUR',
			projectId: project.id,
		};
		await expect(
			checkout(user, checkoutDetails, project, reqContextMock)
		).resolves.toEqual(
			expect.objectContaining({
				id: expect.any(String),
				fundsSource: 'WALLET_EUR',
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
				projectId: project.id,
				userId: user.id,
				amount: new Decimal('500'),
				currency: 'EUR',
				quantityInDecimal: BigInt('47620'),
				paymentId: expect.any(String),
				paymentStatus: 'SUCCEEDED',
				status: 'paid',
				type: 'BUY',
			})
		);
	});

	it('should be able to request more than available', async () => {
		const user = await getUser(user1.id!);
		await creditWallet({
			userId: user.id,
			amount: 1000,
			useSandbox: false,
			paymentType: 'CARD',
		});
		const projectCheap = await prisma.project.findUniqueOrThrow({
			where: { slug: projectCheap1.slug },
			include: projectForCheckoutIncludes,
		});
		const checkoutDetails: CheckoutDTO = {
			totalCent: 1000 * 100,
			currency: 'EUR',
			projectId: projectCheap.id,
		};
		await checkout(user, checkoutDetails, projectCheap, reqContextMock)
			.then(() => {
				throw new Error('This block of code should not be reached');
			})
			.catch((error) => {
				expect(error).toEqual(
					new CheckoutError(
						'The amount of token left for sale is less than the amount you ordered. Do you wish to buy all that is available? (Currently remaining: {{amountLeft}})',
						'CROWDFUNDING_OVERFLOW'
					)
				);
				expect(error.type).toEqual('CROWDFUNDING_OVERFLOW');
				expect(error.context).toMatchObject({
					orderId: expect.any(String),
					crowdfundingState: {
						collectedAmount: new Decimal('0'),
						id: expect.any(String),
						maximumAmount: new Decimal('700'),
						updatedAt: expect.any(Date),
					},
				});
			});
		await expect(
			checkout(
				user,
				{
					...checkoutDetails,
					allowLess: true,
				},
				projectCheap,
				reqContextMock
			)
		).resolves.toMatchObject({
			id: expect.any(String),
			paymentId: expect.any(String),
			amount: new Decimal('736.84'),
			currency: 'EUR',
			fundsSource: 'WALLET_EUR',
			paymentStatus: 'SUCCEEDED',
			project: expect.anything(),
			projectId: projectCheap.id,
			quantityInDecimal: BigInt('701760'),
			status: 'paid',
			type: 'BUY',
			userId: user.id,
		});
	});
});
