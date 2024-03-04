import prisma, { userWithWalletsIncludes } from '../../lib/prismadb';
import { user1 } from '../fixtures/user';
import { ensureEurWallet } from '../../lib/payment/sync';
import { getSellerUser } from '../../lib/user';
import {
	claimToken,
	createFreeTokenPool,
	createTokenClaim,
} from '../../lib/token-claim';
import { product1, project1 } from '../fixtures/project';
import { Prisma } from '@prisma/client';
import { getUser } from '../../lib/auth';

let pool;

const cleanup = async () => {
	// remove in 2 steps because of foreign key constrains
	await prisma.order.deleteMany();
	await prisma.payment.deleteMany();
	await prisma.order.deleteMany();
	await prisma.sandboxOrder.deleteMany();
	await prisma.payment.deleteMany();
	await prisma.oracleProduct.deleteMany();
	await prisma.productInInventory.deleteMany();
	await prisma.productsInProjects.deleteMany();
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
	const seller = await getSellerUser();
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
	pool = await createFreeTokenPool(
		project.id,
		(
			await getSellerUser()
		).id,
		10000, // == project1.targetPrice / 10,
		{
			useSandbox: false,
			allowLess: false,
		}
	);
	const user = await prisma.user.create({
		data: {
			...user1,
		},
		include: userWithWalletsIncludes,
	});
	await ensureEurWallet(user);
};

beforeEach(async () => {
	await cleanup();
	await createFixtures();
});

afterAll(async () => {
	await cleanup();
	await prisma.$disconnect();
});

describe('Basic token claim', () => {
	it('should convert a token claim to a paid order', async () => {
		const quantityInDecimal = 1 * Math.pow(10, project1.tokenDecimals);
		const tokenClaim = await createTokenClaim(
			user1.id,
			quantityInDecimal,
			pool.id
		);
		const order = await claimToken(await getUser(user1.id), tokenClaim.id);
		expect(order).toEqual({
			id: expect.any(String),
			createdAt: expect.any(Date),
			updatedAt: expect.any(Date),
			projectId: pool.projectId,
			userId: user1.id,
			amount: new Prisma.Decimal(0),
			currency: 'EUR',
			paymentId: null,
			paymentStatus: null,
			quantityInDecimal: BigInt(quantityInDecimal),
			status: 'paid',
			fundsSource: 'FREE_TOKEN',
			invoiceUrl: null,
			type: 'BUY',
			executionType: 'LIMIT',
			version: 1,
		});
		const matchingSellOrder = await prisma.order.findFirst({
			where: {
				projectId: pool.projectId,
				userId: (await getSellerUser()).id,
				type: 'SELL',
				executionType: 'LIMIT',
				status: 'processed',
			},
		});

		expect(matchingSellOrder).toEqual(
			expect.objectContaining({
				amount: new Prisma.Decimal(0),
				quantityInDecimal: BigInt(quantityInDecimal),
				status: 'processed',
				fundsSource: 'FREE_TOKEN',
				type: 'SELL',
				executionType: 'LIMIT',
			})
		);
		const poolSellOrder = await prisma.order.findFirst({
			where: {
				projectId: pool.projectId,
				userId: (await getSellerUser()).id,
				type: 'SELL',
				executionType: 'LIMIT',
				status: 'pending',
			},
		});
		expect(poolSellOrder.quantityInDecimal).toEqual(999000n);
	});
});
