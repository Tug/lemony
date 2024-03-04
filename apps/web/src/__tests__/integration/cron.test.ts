import prisma, { userWithWalletsIncludes } from '../../lib/prismadb';
import { seller1, user1 } from '../fixtures/user';
import { product1, project1 } from '../fixtures/project';
import { ensureEurWallet, ensureProjectWallet } from '../../lib/payment/sync';
import creditWallet from '../../../scripts/credit-wallet';
import { generateOrdersInvoice, ordersTemplates } from '../../lib/payment/cron';
import { getOrCreateOrder } from '../../lib/checkout/order';
import axios from 'axios';
import { mockTemplateHandlerProcess } from 'easy-template-x';

jest.mock('axios');
jest.mock('easy-template-x');
jest.mock('@sendgrid/mail');

const cleanup = async () => {
	// remove in 2 steps because of foreign key constrains
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
	const user = await prisma.user.create({
		data: user1,
		include: userWithWalletsIncludes,
	});
	await ensureEurWallet(user);
	await creditWallet({
		userId: user.id,
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

describe('generateOrdersInvoice', () => {
	it('should generate an invoice in english with the right amounts', async () => {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				id: user1.id,
			},
			include: userWithWalletsIncludes,
		});
		const project = await prisma.project.findUniqueOrThrow({
			where: {
				slug: project1.slug,
			},
		});
		const freeCreditsOrder = await getOrCreateOrder(
			{
				userId: user.id,
				projectId: project.id,
				amount: 10,
				quantityInDecimal: 953,
				fundsSource: 'FREE_CREDITS',
				type: 'BUY',
				executionType: 'INITIAL',
				status: 'paid',
				createdAt: new Date('2023-11-15'),
			},
			{
				include: {
					project: true,
				},
			}
		);
		const freeDifiedOrder = await getOrCreateOrder(
			{
				userId: user.id,
				projectId: project.id,
				amount: 0,
				quantityInDecimal: 1000,
				fundsSource: 'FREE_TOKEN',
				type: 'BUY',
				executionType: 'INITIAL',
				status: 'paid',
				createdAt: new Date('2023-11-15'),
			},
			{
				include: {
					project: true,
				},
			}
		);
		const walletOrder = await getOrCreateOrder(
			{
				userId: user.id,
				projectId: project.id,
				amount: 200,
				quantityInDecimal: 19048,
				fundsSource: 'WALLET_EUR',
				type: 'BUY',
				executionType: 'INITIAL',
				status: 'paid',
				createdAt: new Date('2023-11-15'),
			},
			{
				include: {
					project: true,
				},
			}
		);
		axios.get.mockImplementation(async (url) => {
			if (url === ordersTemplates.en) {
				return {
					data: Buffer.from(''),
				};
			}
			if (url === ordersTemplates.fr) {
				return {
					data: Buffer.from(''),
				};
			}
		});
		axios.post.mockImplementation(async (url) => {
			if (
				url ===
				'https://hfltu6zgfiz7bqyphwbp4sfove0jixsb.lambda-url.eu-west-3.on.aws/convert'
			) {
				return {
					data: {
						url: 'http://invoice.pdf',
					},
				};
			}

			return {
				data: {},
			};
		});
		const { content, url, filename, type } = await generateOrdersInvoice(
			user,
			[freeCreditsOrder, freeDifiedOrder, walletOrder]
		);
		expect({ content, url, filename, type }).toEqual({
			content: null,
			filename: expect.any(String), //'Bond_Subscription_52f3493.pdf',
			type: 'application/pdf',
			url: 'http://invoice.pdf',
		});
		expect(axios.post).toHaveBeenCalledWith(
			'https://hfltu6zgfiz7bqyphwbp4sfove0jixsb.lambda-url.eu-west-3.on.aws/convert',
			{
				data: '',
				dstKey: expect.any(String),
				encoding: 'base64',
				filename: 'Invoice-template-en.docx',
			}
		);
		expect(mockTemplateHandlerProcess).toHaveBeenCalledWith(
			expect.any(Buffer),
			{
				date: expect.any(String),
				lang: 'en',
				orders: [
					{
						date: '11/15/2023',
						itemDate: expect.any(Date),
						itemDescription: 'THE AWESOME PROJECT TOKEN',
						itemTotal: '€9.53',
						itemTotalNumber: 9.53,
						itemTotalPaid: '€10',
						itemVat: '0.00%',
						quantity: '0.953',
						unitPrice: '€10',
					},
					{
						date: '11/15/2023',
						itemDate: expect.any(Date),
						itemDescription: 'THE AWESOME PROJECT TOKEN',
						itemTotal: '€10',
						itemTotalNumber: 10,
						itemTotalPaid: '€0',
						itemVat: '0.00%',
						quantity: '1',
						unitPrice: '€10',
					},
					{
						date: '11/15/2023',
						itemDate: expect.any(Date),
						itemDescription: 'THE AWESOME PROJECT TOKEN',
						itemTotal: '€190.48',
						itemTotalNumber: 190.48,
						itemTotalPaid: '€200',
						itemVat: '0.00%',
						quantity: '19.048',
						unitPrice: '€10',
					},
				],
				subtotal: '€210.01',
				taxRate: '0.00%',
				total: '€210.01',
				totalTax: '€0',
				userAddress: expect.any(String),
				userEmailOrPhone: 'user@gmail.com',
				userName: 'John Doe',
			}
		);
	});

	it('should generate an invoice in french with the right amounts', async () => {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				id: user1.id,
			},
			include: userWithWalletsIncludes,
		});
		user.locale = 'fr';
		const project = await prisma.project.findUniqueOrThrow({
			where: {
				slug: project1.slug,
			},
		});
		const freeCreditsOrder = await getOrCreateOrder(
			{
				userId: user.id,
				projectId: project.id,
				amount: 10,
				quantityInDecimal: 953,
				fundsSource: 'FREE_CREDITS',
				type: 'BUY',
				executionType: 'INITIAL',
				status: 'paid',
				createdAt: new Date('2023-11-15'),
			},
			{
				include: {
					project: true,
				},
			}
		);
		const freeDifiedOrder = await getOrCreateOrder(
			{
				userId: user.id,
				projectId: project.id,
				amount: 0,
				quantityInDecimal: 1000,
				fundsSource: 'FREE_TOKEN',
				type: 'BUY',
				executionType: 'INITIAL',
				status: 'paid',
				createdAt: new Date('2023-11-15'),
			},
			{
				include: {
					project: true,
				},
			}
		);
		const walletOrder = await getOrCreateOrder(
			{
				userId: user.id,
				projectId: project.id,
				amount: 200,
				quantityInDecimal: 19048,
				fundsSource: 'WALLET_EUR',
				type: 'BUY',
				executionType: 'INITIAL',
				status: 'paid',
				createdAt: new Date('2023-11-15'),
			},
			{
				include: {
					project: true,
				},
			}
		);
		axios.get.mockImplementation(async (url) => {
			if (url === ordersTemplates.en) {
				return {
					data: Buffer.from(''),
				};
			}
			if (url === ordersTemplates.fr) {
				return {
					data: Buffer.from(''),
				};
			}
		});
		axios.post.mockImplementation(async (url) => {
			if (
				url ===
				'https://hfltu6zgfiz7bqyphwbp4sfove0jixsb.lambda-url.eu-west-3.on.aws/convert'
			) {
				return {
					data: {
						url: 'http://invoice.pdf',
					},
				};
			}

			return {
				data: {},
			};
		});
		const { content, url, filename, type } = await generateOrdersInvoice(
			user,
			[freeCreditsOrder, freeDifiedOrder, walletOrder]
		);
		expect({ content, url, filename, type }).toEqual({
			content: null,
			filename: expect.any(String), //'Bond_Subscription_52f3493.pdf',
			type: 'application/pdf',
			url: 'http://invoice.pdf',
		});
		expect(axios.post).toHaveBeenCalledWith(
			'https://hfltu6zgfiz7bqyphwbp4sfove0jixsb.lambda-url.eu-west-3.on.aws/convert',
			{
				data: '',
				dstKey: expect.any(String),
				encoding: 'base64',
				filename: 'Invoice-template-en.docx',
			}
		);
		expect(mockTemplateHandlerProcess).toHaveBeenCalledWith(
			expect.any(Buffer),
			{
				date: expect.any(String),
				lang: 'fr',
				orders: [
					{
						date: '15/11/2023',
						itemDate: expect.any(Date),
						itemDescription: 'THE AWESOME PROJECT TOKEN',
						itemTotal: '9,53 €',
						itemTotalNumber: 9.53,
						itemTotalPaid: '10 €',
						itemVat: '0,00 %',
						quantity: '0,953',
						unitPrice: '10 €',
					},
					{
						date: '15/11/2023',
						itemDate: expect.any(Date),
						itemDescription: 'THE AWESOME PROJECT TOKEN',
						itemTotal: '10 €',
						itemTotalNumber: 10,
						itemTotalPaid: '0 €',
						itemVat: '0,00 %',
						quantity: '1',
						unitPrice: '10 €',
					},
					{
						date: '15/11/2023',
						itemDate: expect.any(Date),
						itemDescription: 'THE AWESOME PROJECT TOKEN',
						itemTotal: '190,48 €',
						itemTotalNumber: 190.48,
						itemTotalPaid: '200 €',
						itemVat: '0,00 %',
						quantity: '19,048',
						unitPrice: '10 €',
					},
				],
				subtotal: '210,01 €',
				taxRate: '0,00 %',
				total: '210,01 €',
				totalTax: '0 €',
				userAddress: expect.any(String),
				userEmailOrPhone: 'user@gmail.com',
				userName: 'John Doe',
			}
		);
	});
});
