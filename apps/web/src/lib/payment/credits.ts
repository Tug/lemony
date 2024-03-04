import prisma, { Prisma, Decimal, SchemaTypes } from '../prismadb';

const checkTransferIsAllowed = (
	fromUser: Pick<SchemaTypes.User, 'settings'>,
	toUser: Pick<SchemaTypes.User, 'settings'>
) => {
	if (
		Boolean(fromUser.settings?.paymentSandbox) !==
		Boolean(toUser.settings?.paymentSandbox)
	) {
		throw new Error(
			'Cannot convert test money with real money, sender or receiver is using sandbox'
		);
	}
};

export const initiateCreditTransfer = async (
	fromUserId:
		| string
		| Pick<SchemaTypes.User, 'id' | 'settings' | 'creditsEur' | 'role'>,
	toUserId: string | Pick<SchemaTypes.User, 'id' | 'settings'>,
	amount: Decimal,
	tx?: Prisma.TransactionClient
) => {
	const prismaClient = tx ?? prisma;
	const fromUser =
		typeof fromUserId === 'string'
			? await prismaClient.user.findUniqueOrThrow({
					where: { id: fromUserId },
					select: {
						id: true,
						settings: true,
						creditsEur: true,
						role: true,
					},
			  })
			: fromUserId;
	const toUser =
		typeof toUserId === 'string'
			? await prismaClient.user.findUniqueOrThrow({
					where: { id: toUserId },
					select: { id: true, settings: true },
			  })
			: toUserId;
	checkTransferIsAllowed(fromUser, toUser);
	await initiateCreditTransferUnchecked(fromUser, amount, tx);
};

export const confirmCreditTransfer = async (
	toUserId: string | Pick<SchemaTypes.User, 'id' | 'settings' | 'creditsEur'>,
	amount: Decimal,
	tx?: Prisma.TransactionClient
) => {
	const prismaClient = tx ?? prisma;
	const toUser =
		typeof toUserId === 'string'
			? await prismaClient.user.findUniqueOrThrow({
					where: { id: toUserId },
					select: { id: true, settings: true, creditsEur: true },
			  })
			: toUserId;

	await prismaClient.user.update({
		where: { id: toUser.id },
		data: {
			creditsEur: toUser.creditsEur.add(amount),
		},
	});
};

export const undoCreditTransfer = async (
	fromUserId:
		| string
		| Pick<SchemaTypes.User, 'id' | 'settings' | 'creditsEur'>,
	amount: Decimal,
	tx?: Prisma.TransactionClient
) => {
	const prismaClient = tx ?? prisma;
	const fromUser =
		typeof fromUserId === 'string'
			? await prismaClient.user.findUniqueOrThrow({
					where: { id: fromUserId },
					select: { id: true, settings: true, creditsEur: true },
			  })
			: fromUserId;
	await prismaClient.user.update({
		where: { id: fromUser.id },
		data: {
			creditsEur: fromUser.creditsEur.add(amount),
		},
	});
};

export const initiateCreditTransferUnchecked = async (
	fromUserId:
		| string
		| Pick<SchemaTypes.User, 'id' | 'settings' | 'creditsEur' | 'role'>,
	amount: Decimal,
	tx?: Prisma.TransactionClient
) => {
	const prismaClient = tx ?? prisma;
	const fromUser =
		typeof fromUserId === 'string'
			? await prismaClient.user.findUniqueOrThrow({
					where: { id: fromUserId },
					select: {
						id: true,
						settings: true,
						creditsEur: true,
						role: true,
					},
			  })
			: fromUserId;
	const newCreditsEur = fromUser.creditsEur.sub(amount);
	// SELLER users (such as propco) are allowed to have a negative balance
	if (fromUser.role !== SchemaTypes.Role.SELLER && newCreditsEur.lt(0)) {
		throw new Error('Insufficient EUR credits balance');
	}
	await prismaClient.user.update({
		where: {
			id: fromUser.id,
		},
		data: {
			creditsEur: newCreditsEur,
		},
	});
};
