import { fetchAll, getSystemUser, mangopayMoneyToDecimal } from './utils';
import { getPaymentContextForUser, Mango } from './client';
import { getSellerUser } from '../user';
import prisma from '../prismadb';

export async function getMangopayStats() {
	const payer = await getSystemUser('PAYER');
	const { mangoClient, mangopayUserId } = getPaymentContextForUser(payer);
	const payerWallets = await fetchAll((options) =>
		mangoClient.Users.getWallets(mangopayUserId, options)
	);
	const {
		totalEur: totalEurInWallets,
		count: totalWalletsWithPositiveBalance,
	} = payerWallets.reduce(
		(res, wallet) => {
			if (wallet.Balance.Currency === 'EUR') {
				res.totalEur += wallet.Balance.Amount / 100;
			}
			if (wallet.Balance.Amount > 0) {
				res.count++;
			}
			return res;
		},
		{ totalEur: 0, count: 0 }
	);
	const feesClientWallet = await mangoClient.Clients.getClientWallet(
		'FEES',
		'EUR'
	);
	const creditClientWallet = await mangoClient.Clients.getClientWallet(
		'CREDIT',
		'EUR'
	);
	const { mangopayCreditsWalletId } = await getSystemUser('OWNER');
	const freeCreditsWallet = await mangoClient.Wallets.get(
		mangopayCreditsWalletId
	);
	const propcoUser = await getSellerUser();
	const { mangopayWalletId: propcoMangopayWalletId } =
		getPaymentContextForUser(propcoUser);
	const propcoWallet = await mangoClient.Wallets.get(propcoMangopayWalletId);
	return {
		freeCreditsWalletBalance: freeCreditsWallet.Balance.Amount / 100,
		propcoWalletBalance: propcoWallet.Balance.Amount / 100,
		totalEurInWallets,
		totalWalletsWithPositiveBalance,
		diversifiedFeesWalletBalance: feesClientWallet.Balance.Amount / 100,
		diversifiedCreditWalletBalance: creditClientWallet.Balance.Amount / 100,
	};
}

export async function getProjectWalletsStats() {
	const owner = await getSystemUser('OWNER');
	const { mangoClient, mangopayUserId } = getPaymentContextForUser(owner);
	const ownerWallets = await fetchAll((options) =>
		mangoClient.Users.getWallets(mangopayUserId, options)
	);
	const projects = await prisma.project.findMany({
		select: {
			tokenName: true,
			mangopayWalletId: true,
			owner: true,
			paid: true,
			crowdfundingState: {
				select: {
					collectedAmount: true,
					maximumAmount: true,
				},
			},
			documentUrl: true,
		},
	});
	const projectsIndexedByWalletId = projects.reduce((res, project) => {
		res[project.mangopayWalletId] = project;
		return res;
	}, {});
	const projectsWallets = ownerWallets.filter(({ Id }) =>
		Boolean(projectsIndexedByWalletId[Id])
	);
	for (const wallet of projectsWallets) {
		const payouts = await mangoClient.Wallets.getTransactions(wallet.Id, {
			parameters: {
				Status: 'SUCCEEDED,CREATED',
				Type: 'PAYOUT',
			},
		});
		projectsIndexedByWalletId[wallet.Id].payout = payouts?.[0];
	}
	return projectsWallets.map((wallet) => ({
		project: projectsIndexedByWalletId[wallet.Id].tokenName,
		collectedAmount:
			projectsIndexedByWalletId[wallet.Id].crowdfundingState
				?.collectedAmount,
		maximumAmount:
			projectsIndexedByWalletId[wallet.Id].crowdfundingState
				?.maximumAmount,
		paid: projectsIndexedByWalletId[wallet.Id].paid,
		walletBalance: wallet.Balance.Amount / 100,
		walletCurrency: wallet.Balance.Currency,
		tcUrl: projectsIndexedByWalletId[wallet.Id].documentUrl,
		...(projectsIndexedByWalletId[wallet.Id].payout && {
			payoutDate: projectsIndexedByWalletId[wallet.Id].payout
				?.ExecutionDate
				? new Date(
						projectsIndexedByWalletId[wallet.Id].payout
							?.ExecutionDate * 1000
				  )
				: null,
			payoutFees:
				projectsIndexedByWalletId[wallet.Id].payout?.Fees.Amount / 100,
			payoutCreditedAmount:
				projectsIndexedByWalletId[wallet.Id].payout?.CreditedFunds
					.Amount / 100,
			payoutDebitedAmount:
				projectsIndexedByWalletId[wallet.Id].payout?.DebitedFunds
					.Amount / 100,
		}),
	}));
}

export async function getAllDisputes() {
	const mangoClient = Mango.getDefaultClient({ useSandbox: false });
	return fetchAll((options) => mangoClient.Disputes.getAll(options));
}
