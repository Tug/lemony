import { getOrCreateOrder } from './checkout/order';
import { FundsSourceType } from '@prisma/client';
import prisma, {
	Decimal,
	extendTransaction,
	freeTokenPoolIncludes,
	Prisma,
	projectForCheckoutIncludes,
	SchemaTypes,
	tokenClaimIncludes,
	UserForCheckout,
	UserTokenClaimWithProject,
} from './prismadb';
import { crowdfundProject } from './checkout';
import { getI18nServerInstance } from './i18n';
import { processBuyOrder } from './orders/market';
import { TokenClaim } from '@diversifiedfinance/types/diversified';
import { difiedNumber } from '@diversifiedfinance/app/components/checkout/currency-utils';
import { dispatchNotification } from './notifications';
import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import { getPaymentContextForUser } from './payment/client';

export function toPublicTokenClaim(
	tokenClaim: SchemaTypes.UserTokenClaim
): TokenClaim {
	return {
		id: tokenClaim.id,
		userId: tokenClaim.userId,
		quantityInDecimal: Number(tokenClaim.quantityInDecimal), // serialize big int
		quantity: difiedNumber(
			new Prisma.Decimal(tokenClaim.quantityInDecimal.toString()).div(
				Math.pow(10, tokenClaim.pool?.project?.tokenDecimals ?? 3)
			)
		),
		createdAt: tokenClaim.createdAt,
		expiresAt: tokenClaim.expiresAt,
		projectId: tokenClaim.pool?.projectId,
		projectSlug: tokenClaim.pool?.project.slug,
		tokenName: tokenClaim.pool?.project?.tokenName,
	};
}

export async function createFreeTokenPool(
	projectId: string,
	ownerId: string,
	amountEur: number = Number.MAX_SAFE_INTEGER,
	{
		useSandbox = false,
		allowLess = true,
	}: { useSandbox: boolean; allowLess: boolean } = {}
): Promise<SchemaTypes.FreeTokenPool> {
	const i18n = await getI18nServerInstance();
	const project = await prisma.project.findUniqueOrThrow({
		where: { id: projectId },
		include: projectForCheckoutIncludes,
	});
	return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
		let amountCrowdfunded;
		if (useSandbox) {
			amountCrowdfunded = new Decimal(amountEur);
		} else {
			amountCrowdfunded = await crowdfundProject(
				project,
				amountEur,
				{
					allowLess,
					useSandbox,
					reqContext: { i18n },
				},
				tx
			);
		}
		const quantityInDecimal = new Prisma.Decimal(amountCrowdfunded)
			.mul(Math.pow(10, project.tokenDecimals))
			.dividedBy(project.tokenPrice)
			.round()
			.toNumber();
		await getOrCreateOrder(
			{
				userId: ownerId,
				projectId,
				amount: amountCrowdfunded,
				quantityInDecimal,
				fundsSource: FundsSourceType.DIVERSIFIED,
				type: 'BUY',
				executionType: 'INITIAL',
				status: 'processed',
			},
			{ useSandbox },
			tx
		);
		await getOrCreateOrder(
			{
				userId: ownerId,
				projectId,
				// selling for free (with conditions)
				amount: 0,
				quantityInDecimal,
				fundsSource: FundsSourceType.FREE_TOKEN,
				type: 'SELL',
				executionType: 'LIMIT',
			},
			{ useSandbox },
			tx
		);
		if (useSandbox) {
			try {
				return await tx.freeTokenPool.findFirstOrThrow({
					where: {
						projectId,
						ownerId,
						sizeInDecimal: quantityInDecimal,
					},
				});
			} catch (err) {
				throw new Error(
					'Free token pool needs to exist for real to be able to replicate it on sandbox'
				);
			}
		} else {
			return await tx.freeTokenPool.create({
				data: {
					projectId,
					ownerId,
					sizeInDecimal: quantityInDecimal,
				},
			});
		}
	});
}

export async function createTokenClaim(
	userId: string,
	quantityInDecimal: BigInt | number,
	poolId: string,
	{ useSandbox = false }: { useSandbox?: boolean } = {},
	tx: Prisma.TransactionClient = prisma
): Promise<SchemaTypes.UserTokenClaim> {
	// transaction client need to be extendable (see `transactionExtendable`)
	return await extendTransaction(tx).$transaction(
		async (tx2): Promise<SchemaTypes.UserTokenClaim> => {
			const userTokenClaimCollection = useSandbox
				? tx2.sandboxUserTokenClaim
				: tx2.userTokenClaim;
			const tokenClaim = await userTokenClaimCollection.create({
				data: {
					userId,
					quantityInDecimal,
					poolId,
				},
			});
			if (!useSandbox) {
				const poolUpdated = await tx2.freeTokenPool.update({
					where: {
						id: poolId,
					},
					data: {
						offeredInDecimal: {
							increment: quantityInDecimal,
						},
					},
				});
				if (poolUpdated.offeredInDecimal > poolUpdated.sizeInDecimal) {
					throw new Error(
						'Pool does not have sufficient token quantity'
					);
				}
			}
			return tokenClaim;
		}
	);
}

export async function giveRandomTokenClaim(
	user: UserForCheckout,
	difiedAmount: number,
	tx: Prisma.TransactionClient = prisma
): Promise<UserTokenClaimWithProject> {
	const { useSandbox } = getPaymentContextForUser(user);
	const pools = await tx.freeTokenPool.findMany({
		// TODO: upgrade to prisma 5 in order to use fieldReference feature
		// where: {
		// 	offeredInDecimal: {
		// 		lt: prisma.freeTokenPool.fields.sizeInDecimal,
		// 	},
		// },
		include: tokenClaimIncludes.pool.include,
	});
	const availablePools = pools.filter(
		(pool) =>
			Number(pool.sizeInDecimal - pool.offeredInDecimal) /
				Math.pow(10, pool.project.tokenDecimals) >
			difiedAmount
	);
	if (availablePools.length === 0) {
		throw new Error('No available token pool');
	}
	const randomPool =
		availablePools[Math.floor(Math.random() * availablePools.length)];
	const tokenClaim = await createTokenClaim(
		user.id,
		difiedAmount * Math.pow(10, randomPool.project.tokenDecimals),
		randomPool.id,
		{ useSandbox },
		tx
	);
	if (!tokenClaim.pool) {
		tokenClaim.pool = randomPool;
	}
	return tokenClaim as UserTokenClaimWithProject;
}

export async function claimToken(
	user: UserForCheckout,
	tokenClaimId: string,
	tx: Prisma.TransactionClient = prisma
): Promise<SchemaTypes.Order> {
	const { useSandbox } = getPaymentContextForUser(user);
	const userTokenClaimCollection = useSandbox
		? tx.sandboxUserTokenClaim
		: tx.userTokenClaim;
	const orderCollection = useSandbox ? tx.sandboxOrder : tx.order;
	const tokenClaim = await userTokenClaimCollection.findUniqueOrThrow({
		where: {
			id: tokenClaimId,
		},
		include: {
			pool: true,
		},
	});
	if (user.id !== tokenClaim.userId) {
		throw new Error('Token claim user mismatch');
	}
	// const propco = await getSellerUser();
	// transaction client need to be extendable (see `transactionExtendable`)
	// TODO: make tx returned by transactionExtendable of type PrismaClient
	const [_, buyOrder] = await tx.$transaction([
		userTokenClaimCollection.delete({
			where: {
				id: tokenClaimId,
			},
		}),
		orderCollection.create({
			data: {
				userId: user.id,
				projectId: tokenClaim.pool.projectId,
				amount: 0,
				quantityInDecimal: tokenClaim.quantityInDecimal,
				fundsSource: 'FREE_TOKEN',
				executionType: 'LIMIT',
				type: 'BUY',
				status: 'pending',
			},
		}),
	]);
	// process order immediately
	const buyOrderUpdated = await processBuyOrder(buyOrder, { useSandbox });
	if (!buyOrderUpdated) {
		throw new Error('Token claim order processing failed');
	}
	// update user updatedAt so we sync token claim amount with
	// external services such as customerio
	await prisma.user.update({
		where: { id: tokenClaim.userId },
		data: { updatedAt: new Date() },
	});
	return buyOrderUpdated;
}

export async function getUserTokenClaims(
	user: UserForCheckout,
	projectIdOrSlug?: string
): Promise<UserTokenClaimWithProject[]> {
	const { useSandbox } = getPaymentContextForUser(user);
	const userTokenClaimCollection = useSandbox
		? prisma.sandboxUserTokenClaim
		: prisma.userTokenClaim;
	const userTokenClaims = await userTokenClaimCollection.findMany({
		where: {
			userId: user.id,
			...(projectIdOrSlug && {
				pool: {
					project: {
						OR: [
							{ id: projectIdOrSlug },
							{ slug: projectIdOrSlug },
						],
					},
				},
			}),
			expiresAt: {
				gt: new Date(),
			},
		},
		include: tokenClaimIncludes,
	});
	return userTokenClaims;
}

export async function getFreeTokenPool(
	poolId: string,
	tx: Prisma.TransactionClient = prisma
) {
	return await tx.freeTokenPool.findUnique({
		where: {
			id: poolId,
		},
		include: freeTokenPoolIncludes,
	});
}

export function getTokenClaimAmount(
	tokenClaim: UserTokenClaimWithProject
): number {
	return difiedNumber(
		new Decimal(tokenClaim.quantityInDecimal.toString()).div(
			Math.pow(10, tokenClaim.pool.project.tokenDecimals)
		)
	);
}

export async function postCreateTokenClaim(
	tokenClaim: SchemaTypes.UserTokenClaim,
	reason: 'first-investment' | 'referral'
) {
	if (!tokenClaim.pool) {
		tokenClaim.pool = await getFreeTokenPool(tokenClaim.poolId);
	}
	// update user updatedAt so we sync token claim amount with
	// external services such as customerio
	await prisma.user.update({
		where: { id: tokenClaim.userId },
		data: { updatedAt: new Date() },
	});
	const tokenAmountNumber = getTokenClaimAmount(
		tokenClaim as UserTokenClaimWithProject
	);
	let description;
	if (reason === 'first-investment') {
		description = `You won {{count, number(minimumFractionDigits: 0, maximumFractionDigits: 4)}} DIFIED for your first investment. Claim it now!`;
	} else if (reason === 'referral') {
		description = `You won {{count, number(minimumFractionDigits: 0, maximumFractionDigits: 4)}} DIFIED thanks to your customer referral. Claim it now!`;
	}
	const path = getPath('tokenClaim', { slug: tokenClaim.pool.project.slug });
	await dispatchNotification({
		recipientId: tokenClaim.userId,
		type: 'marketing_general',
		content: {
			title: 'You won DIFIED!',
			description,
			path,
			vars: { count: tokenAmountNumber },
		},
	});
}
