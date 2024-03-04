import { Prisma } from '../../lib/prismadb';

export const product1: Prisma.ProductInInventoryCreateInput = {
	// id: 'cles38sfffc7p54bg9sfes',
	externalId: '7001',
	title: 'product1',
	supplier: 'supplier1',
	oracleProducts: {
		create: [
			{
				// id: 'cles38sfffc7p54bg9sfed',
				externalId: '8001',
				oracle: {
					connectOrCreate: {
						where: {
							id: 'winesearcher',
						},
						create: {
							id: 'winesearcher',
							name: 'winesearcher.com',
						},
					},
				},
				currency: 'EUR',
				fixedFees: 0,
				hasFees: false,
				hasVAT: false,
				percentageFees: 0,
				vatPercent: 0,
				enabled: true,
			},
		],
	},
};

export const project1: Prisma.ProjectCreateInput = {
	// id: 'clfa18yhv006sfc7pd01b1gfy',
	// externalId: '3001',
	slug: 'project-1',
	title: 'An Awesome Project',
	content: 'An Awesome Project content',
	description: 'An Awesome Project description',
	media: [],
	tags: ['cat1', 'cat2', 'cat3'],
	expectedAPR: 10,
	tokenSymbol: 'AWESOME',
	tokenName: 'THE AWESOME PROJECT TOKEN',
	tokenDecimals: 3,
	stoWalletAddress: '0x01812d7e3a9829e5d51bdd64ceb35dfa',
	targetPrice: 100000,
	visibility: 'development',
	maxSupplyInDecimal: 10000 * Math.pow(10, 4),
	tokenPrice: 10,
	durationInMonths: 12 * 5,
	visibleAt: new Date(),
	crowdfundingStartsAt: new Date(),
	crowdfundingEndsAt: new Date(),
};

export const productCheap1: Prisma.ProjectCreateInput = {
	// id: 'cfe3gs43gjesj345igjes3',
	externalId: '7002',
	title: 'productCheap1',
	supplier: 'supplier1',
	oracleProducts: {
		create: [
			{
				// id: 'cfe3gs43gjesj345igjes4',
				externalId: '8002',
				oracle: {
					connectOrCreate: {
						where: {
							id: 'winesearcher',
						},
						create: {
							id: 'winesearcher',
							name: 'winesearcher.com',
						},
					},
				},
				currency: 'EUR',
				fixedFees: 0,
				hasFees: false,
				hasVAT: false,
				percentageFees: 0,
				vatPercent: 0,
				enabled: true,
			},
		],
	},
};

// cheap project can easily be crowdfunded in a single (or few) payments
export const projectCheap1: Prisma.ProjectCreateInput = {
	// id: 'cfe94prs5farmkg7kmrl',
	// externalId: '3002',
	slug: 'project-cheap',
	title: 'A cheap Project',
	content: 'A cheap Project content',
	description: 'A cheap Project description',
	media: [],
	tags: ['cheap1', 'cheap2'],
	expectedAPR: 10,
	tokenSymbol: 'CHEAP',
	tokenName: 'THE CHEAP PROJECT TOKEN',
	tokenDecimals: 4,
	stoWalletAddress: '0x02222222222222222222222',
	targetPrice: 700,
	visibility: 'development',
	maxSupplyInDecimal: 70 * Math.pow(10, 4),
	tokenPrice: 10,
	durationInMonths: 12 * 3,
	visibleAt: new Date(),
	crowdfundingStartsAt: new Date(),
	crowdfundingEndsAt: new Date(),
};
