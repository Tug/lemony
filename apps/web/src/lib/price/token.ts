import prisma from '../prismadb';
import { dbResultsToPrices } from './utils';
import { Prices } from '@diversifiedfinance/types';
import { PriceResult } from './types';

export interface TokenPrice {
	code: string;
	title: string;
	initialPrice: string;
	lastPrice: string;
	currency: string;
}

export interface UserTokenPrice extends TokenPrice {
	amountWithFees: string;
	initialValue: string;
	lastPrice: string;
	lastValue: string;
	currency: string;
	quantity: string;
}

export async function getUserTokens(
	userId: string
): Promise<Array<UserTokenPrice>> {
	const tokens = await prisma.userToken.findMany({
		where: {
			userId,
		},
		include: {
			project: {
				select: {
					tokenSymbol: true,
					title: true,
					tags: true,
				},
			},
		},
	});

	return tokens.map((token) => ({
		code: token.project.tokenSymbol,
		title: token.project.title,
		tags: token.project.tags,
		initialPrice: token.initialPrice,
		lastPrice: token.lastPrice,
		currency: token.currency,
		amountWithFees: token.amountSpent,
		initialValue: token.initialValue,
		lastValue: token.lastValue,
		quantity: token.quantity.toNumber(),
	}));
}

export async function getTokenPrices(tokenSymbol: string): Promise<Prices> {
	const tokenPrices = await prisma.tokenPrice.findMany({
		where: {
			project: {
				tokenSymbol,
			},
		},
		orderBy: [
			{
				projectId: 'asc',
			},
			{
				period: 'asc',
			},
			{ date: 'asc' },
		],
	});
	return dbResultsToPrices(tokenPrices);
}

function groupBy<T>(list: T[], getGroup: (element: T) => string) {
	return list.reduce((result, element: T) => {
		const key = getGroup(element);
		if (!result[key]) {
			result[key] = [];
		}
		result[key].push(element);
		return result;
	}, {} as { [groupName: string]: T[] });
}

export async function getAllTokensPrices(): Promise<
	Array<{
		currency: 'EUR';
		prices: Prices;
		projectId: string;
	}>
> {
	const tokenPrices = await prisma.tokenPrice.findMany({
		where: {
			project: {
				visibility: 'production',
			},
		},
		orderBy: [
			{
				projectId: 'asc',
			},
			{
				period: 'asc',
			},
			{ date: 'asc' },
		],
	});
	return Object.entries(
		groupBy<PriceResult & { projectId: string }>(
			tokenPrices,
			(tokenRow) => tokenRow.projectId
		)
	).map(([projectId, prices]) => ({
		projectId,
		currency: 'EUR',
		prices: dbResultsToPrices(prices),
	}));
}

export async function getAllTokensStats(): Promise<Array<TokenPrice>> {
	const projets = await prisma.project.findMany({
		where: {
			visibility: 'production',
		},
		select: {
			tokenName: true,
			tokenSymbol: true,
			title: true,
			tokenPrice: true,
			lastTokenPrice: true,
		},
	});

	return projets.map((project) => ({
		code: project.tokenSymbol,
		name: project.tokenName,
		title: project.title,
		initialPrice: project.tokenPrice,
		lastPrice: project.lastTokenPrice.mean,
		currency: 'EUR',
	}));
}

export async function getTokenStats(
	tokenSymbol: string
): Promise<TokenPrice | null> {
	const token = await prisma.lastTokenPrice.findFirst({
		where: {
			project: {
				tokenSymbol,
			},
		},
		include: {
			project: {
				select: {
					tokenName: true,
					tokenSymbol: true,
					title: true,
					tokenPrice: true,
				},
			},
		},
	});
	if (!token) {
		return null;
	}

	return {
		code: token.project.tokenSymbol,
		name: token.project.tokenName,
		title: token.project.title,
		initialPrice: token.project.tokenPrice,
		lastPrice: token.mean,
		currency: 'EUR',
	};
}
