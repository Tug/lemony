import prisma, {
	userWithWalletsIncludes,
	SchemaTypes,
	Decimal,
} from '../../lib/prismadb';
import { user1, user2 } from '../fixtures/user';
import { ensureEurWallet } from '../../lib/payment/sync';
import { getSellerUser } from '../../lib/user';
import { project1 } from '../fixtures/project';
import { createSellOrder } from '../../lib/orders/sell';

const cleanup = async () => {
	await prisma.order.deleteMany();
	await prisma.sandboxOrder.deleteMany();
	await prisma.user.deleteMany({
		where: {
			AND: [
				{ role: { not: 'ADMIN' } },
				{ email: { not: 'propco@diversified.fi' } },
			],
		},
	});
	await prisma.project.deleteMany();
	await prisma.projectCrowdfundingState.deleteMany();
};

const projectId = 'clfa18yhv006sfc7pd01b1gfy';

const createFixtures = async () => {
	const seller = await getSellerUser();
	const user1db = await prisma.user.create({
		data: {
			...user1,
		},
		include: userWithWalletsIncludes,
	});
	const user2db = await prisma.user.create({
		data: {
			...user2,
		},
		include: userWithWalletsIncludes,
	});
	await ensureEurWallet(user1db);
	await ensureEurWallet(user2db);
	const project = await prisma.project.create({
		data: {
			id: projectId,
			...project1,
			owner: { connect: { id: seller.id } },
			crowdfundingState: {
				create: {
					collectedAmount: 0,
					maximumAmount: project1.targetPrice,
				},
			},
		},
	});
};

beforeEach(async () => {
	await cleanup();
	await createFixtures();
});

afterAll(async () => {
	await cleanup();
	await prisma.$disconnect();
});

describe('Orders', () => {
	describe('Create sell orders', () => {
		it('should be able to create sell orders', async () => {
			await prisma.order.createMany({
				data: [
					{
						userId: user1.id!,
						projectId,
						amount: 0,
						quantityInDecimal: 1000,
						fundsSource: SchemaTypes.FundsSourceType.FREE_TOKEN,
						type: 'BUY',
						executionType: 'INITIAL',
						status: 'processed',
					},
					{
						userId: user1.id!,
						projectId,
						amount: 300,
						quantityInDecimal: 20000,
						fundsSource: SchemaTypes.FundsSourceType.WALLET_EUR,
						type: 'BUY',
						executionType: 'INITIAL',
						status: 'processed',
					},
				],
			});
			const sellOrder = await createSellOrder({
				userId: user1.id!,
				projectId,
				sellQuantityInDecimal: BigInt(21000),
				amount: 500,
			});
			expect(sellOrder).toMatchObject({
				userId: user1.id!,
				projectId,
				amount: new Decimal(500),
				quantityInDecimal: BigInt(21000),
			});
		});

		it('should be atomic', async () => {
			await prisma.order.createMany({
				data: [
					{
						userId: user1.id!,
						projectId,
						amount: 0,
						quantityInDecimal: 1000,
						fundsSource: SchemaTypes.FundsSourceType.FREE_TOKEN,
						type: 'BUY',
						executionType: 'INITIAL',
						status: 'processed',
					},
					{
						userId: user1.id!,
						projectId,
						amount: 300,
						quantityInDecimal: 20000,
						fundsSource: SchemaTypes.FundsSourceType.WALLET_EUR,
						type: 'BUY',
						executionType: 'INITIAL',
						status: 'processed',
					},
				],
			});
			const responses = await Promise.allSettled([
				createSellOrder({
					userId: user1.id!,
					projectId,
					sellQuantityInDecimal: BigInt(21000),
					amount: 500,
				}),
				createSellOrder({
					userId: user1.id!,
					projectId,
					sellQuantityInDecimal: BigInt(21000),
					amount: 500,
				}),
			]);
			expect(responses).toEqual(
				expect.arrayContaining([
					{
						status: 'fulfilled',
						value: expect.objectContaining({
							userId: user1.id!,
							projectId,
							amount: new Decimal(500),
							quantityInDecimal: BigInt(21000),
							currency: 'EUR',
							executionType: 'LIMIT',
							status: 'pending',
							type: 'SELL',
						}),
					},
					{
						reason: new Error('Not enough tokens to sell'),
						status: 'rejected',
					},
				])
			);
		});
	});

	describe('Match a buy order with (multiple) sell orders', () => {
		it('should work for 1-1 parity orders', async () => {
			await prisma.order.createMany({
				data: [
					{
						userId: user1.id!,
						projectId,
						amount: 0,
						quantityInDecimal: 1000,
						fundsSource: SchemaTypes.FundsSourceType.FREE_TOKEN,
						type: 'BUY',
						executionType: 'INITIAL',
						status: 'processed',
					},
					{
						userId: user1.id!,
						projectId,
						amount: 300,
						quantityInDecimal: 20000,
						fundsSource: SchemaTypes.FundsSourceType.WALLET_EUR,
						type: 'BUY',
						executionType: 'INITIAL',
						status: 'processed',
					},
				],
			});
			const sellOrder = await createSellOrder({
				userId: user1.id!,
				projectId,
				sellQuantityInDecimal: BigInt(21000),
				amount: 500,
			});
			expect(sellOrder).toMatchObject({
				userId: user1.id!,
				projectId,
				amount: new Decimal(500),
				quantityInDecimal: BigInt(21000),
			});
		});

		it('should be atomic', async () => {
			await prisma.order.createMany({
				data: [
					{
						userId: user1.id!,
						projectId,
						amount: 0,
						quantityInDecimal: 1000,
						fundsSource: SchemaTypes.FundsSourceType.FREE_TOKEN,
						type: 'BUY',
						executionType: 'INITIAL',
						status: 'processed',
					},
					{
						userId: user1.id!,
						projectId,
						amount: 300,
						quantityInDecimal: 20000,
						fundsSource: SchemaTypes.FundsSourceType.WALLET_EUR,
						type: 'BUY',
						executionType: 'INITIAL',
						status: 'processed',
					},
				],
			});
			const responses = await Promise.allSettled([
				createSellOrder({
					userId: user1.id!,
					projectId,
					sellQuantityInDecimal: BigInt(21000),
					amount: 500,
				}),
				createSellOrder({
					userId: user1.id!,
					projectId,
					sellQuantityInDecimal: BigInt(21000),
					amount: 500,
				}),
			]);
			expect(responses).toEqual(
				expect.arrayContaining([
					{
						status: 'fulfilled',
						value: expect.objectContaining({
							userId: user1.id!,
							projectId,
							amount: new Decimal(500),
							quantityInDecimal: BigInt(21000),
							currency: 'EUR',
							executionType: 'LIMIT',
							status: 'pending',
							type: 'SELL',
						}),
					},
					{
						reason: new Error('Not enough tokens to sell'),
						status: 'rejected',
					},
				])
			);
		});
	});
});
