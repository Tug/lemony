import { useAuth } from './auth/use-auth';
import { fetcher, swrFetcher } from './use-infinite-list-query';
import {
	BankAccountsResponse,
	GetOrdersResponse,
	MyReferralInfoResponse,
	MyTokenClaimsResponse,
	PricesResponse,
	TokenClaimsListResponse,
	WalletResponse,
} from '@diversifiedfinance/types';
import type {
	MyInfo,
	Order,
	Settings,
} from '@diversifiedfinance/types/diversified';
import { useCallback, useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import type { SWRResponse } from 'swr';
import type { card, bankAccount, payOut } from 'mangopay2-nodejs-sdk';
import { axios } from '@diversifiedfinance/app/lib/axios';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import {
	OrderOfProject,
	TokenClaim,
} from '@diversifiedfinance/types/diversified';
import { useProject } from '@diversifiedfinance/app/hooks/use-project';
import { getTokenAmount } from '@diversifiedfinance/app/lib/tokens';
import { TokenRowProps } from '@diversifiedfinance/app/components/portfolio/token-row';

export const defaultFilters = {
	showHidden: 0,
	collectionId: 0,
	sortType: 'newest',
};

export const MY_INFO_ENDPOINT = '/api/userinfo';
export const PRICE_ENDPOINT = '/api/price';
export const TOKEN_PRICE_ENDPOINT = '/api/price/token';
export const WALLETS_ENDPOINT = '/api/wallet';
export const CARDS_ENDPOINT = '/api/payment/mangopay/cards';
export const BANK_ACCOUNTS_ENDPOINT = '/api/payment/mangopay/bank-accounts';
export const CHECKOUT_ENDPOINT = '/api/payment/checkout';
export const ORDERS_ENDPOINT = '/api/order';
export const USER_SETTINGS_ENDPOINT = '/api/user/settings';
export const USER_TOKEN_CLAIMS_ENDPOINT = '/api/token-claim';

export const useMyInfo = () => {
	const { accessToken } = useAuth();
	const queryKey = MY_INFO_ENDPOINT;
	const { data, error, mutate } = useSWR<MyInfo>(
		accessToken ? queryKey : null,
		fetcher,
		{
			revalidateOnMount: false,
		}
	);

	// Don't logout everyone if our server fails
	// useEffect(() => {
	// 	if (error) {
	// 		logout();
	// 	}
	// }, [error, logout]);

	return {
		data,
		loading: !data,
		error,
		mutate,
	};
};

export const usePrice = (projectIdOrTokenSymbol?: string) => {
	const { data, isLoading, isValidating, error, mutate } =
		useSWR<PricesResponse>(
			projectIdOrTokenSymbol
				? `${PRICE_ENDPOINT}?projectId=${projectIdOrTokenSymbol}`
				: null,
			swrFetcher,
			{
				revalidateOnMount: true,
				revalidateOnFocus: false,
			}
		);

	return {
		data: data?.prices,
		currency: data?.currency,
		isLoading,
		isValidating,
		error,
		mutate,
	};
};

export const useTokensPriceHistory = () => {
	const { data, isLoading, isValidating, error, mutate } =
		useSWR<PricesResponse>(`${TOKEN_PRICE_ENDPOINT}/history`, swrFetcher);

	return {
		data,
		currency: data?.currency,
		isLoading,
		isValidating,
		error,
		mutate,
	};
};

export const useLastTokenPrice = (tokenSymbol: string) => {
	const { data, isLoading, isValidating, error, mutate } =
		useSWR<PricesResponse>(
			tokenSymbol ? `${TOKEN_PRICE_ENDPOINT}/${tokenSymbol}/last` : null,
			swrFetcher,
			{
				revalidateOnMount: true,
				revalidateOnFocus: false,
			}
		);

	return {
		data,
		currency: data?.currency,
		isLoading,
		isValidating,
		error,
		mutate,
	};
};

export const usePortfolioPrice = () => {
	const { data, isLoading, isValidating, error, mutate } =
		useSWR<PricesResponse>(`${PRICE_ENDPOINT}/portfolio`, fetcher, {
			revalidateOnMount: true,
		});

	return {
		data: data?.prices,
		currency: data?.currency,
		isLoading,
		isValidating,
		error,
		mutate,
	};
};

export const useWallets = () => {
	useUser({ requireAuth: true });
	return useSWR<WalletResponse>(WALLETS_ENDPOINT, fetcher);
};

export const useEurWallet = () => {
	const swrRes = useWallets();
	const eurWallet = swrRes.data?.fiat?.find(
		({ currency }) => currency === 'EUR'
	);

	return {
		...swrRes,
		data: eurWallet,
	};
};

export const useCreditsWallet = () => {
	const swrRes = useWallets();
	const creditWallet = swrRes.data?.credits?.find(
		({ currency }) => currency === 'EUR'
	);

	return {
		...swrRes,
		data: creditWallet,
	};
};

export const useCards = () => {
	const swrResult = useSWR<Array<card.CardData & { isLastUsed: boolean }>>(
		CARDS_ENDPOINT,
		fetcher
	);

	const activeCard = swrResult.data?.find((card) => card.isLastUsed);

	const deleteCard = useCallback(
		async (cardId: string) => {
			await axios({
				method: 'delete',
				url: `${CARDS_ENDPOINT}/${cardId}`,
			});
			await swrResult.mutate();
		},
		[swrResult.mutate]
	);

	return {
		...swrResult,
		activeCard,
		deleteCard,
	};
};

export const useBankAccounts = (revalidate = true) => {
	const swrResult = useSWR<BankAccountsResponse>(
		BANK_ACCOUNTS_ENDPOINT,
		fetcher,
		{
			revalidateOnFocus: revalidate,
			revalidateOnMount: revalidate,
		}
	);

	const addBankAccount = useCallback(
		async (bankAccountInfo: bankAccount.IBANDetails) => {
			return await axios({
				method: 'post',
				url: BANK_ACCOUNTS_ENDPOINT,
				data: bankAccountInfo,
			});
		},
		[]
	);

	const editBankAccount = useCallback(
		async (bankAccountId: string, data: { label?: string }) => {
			return await axios({
				method: 'patch',
				url: `${BANK_ACCOUNTS_ENDPOINT}/${bankAccountId}`,
				data,
			});
		},
		[]
	);

	const removeBankAccount = useCallback(async (bankAccountId: string) => {
		return await axios({
			method: 'delete',
			url: `${BANK_ACCOUNTS_ENDPOINT}/${bankAccountId}`,
		});
	}, []);

	const payout = useCallback(
		async (
			bankAccountId: string,
			payoutData: {
				amountCent: number;
				currency: 'EUR';
				label?: string;
				instant?: boolean;
			}
		) => {
			return await axios({
				method: 'post',
				url: `${BANK_ACCOUNTS_ENDPOINT}/${bankAccountId}/transactions/payout`,
				data: payoutData,
			});
		},
		[]
	);

	return {
		...swrResult,
		editBankAccount,
		addBankAccount,
		removeBankAccount,
		payout,
	};
};

export const useBankAccountTransactions = (bankAccountId?: string) => {
	return useSWR<payOut.PayOutData[]>(
		bankAccountId
			? `${BANK_ACCOUNTS_ENDPOINT}/${bankAccountId}/transactions`
			: null,
		fetcher
	);
};

interface CheckoutState {
	orderId?: string;
	isPending: boolean;
	isCompleted: boolean;
	isSuccess?: boolean;
	data?: Order;
	error?: Error;
}

export const useCheckout = ({ projectId }: { projectId: string }) => {
	const [checkoutState, setCheckoutState] = useState<CheckoutState>({
		isPending: false,
		isCompleted: false,
		isSuccess: undefined,
		data: undefined,
		error: undefined,
	});

	const checkout = useCallback(
		async ({
			amountEur,
			allowLess = false,
		}: {
			amountEur: number;
			allowLess?: boolean;
		}) =>
			await axios({
				method: 'post',
				url: CHECKOUT_ENDPOINT,
				data: {
					orderId: checkoutState?.data?.id,
					projectId,
					currency: 'EUR',
					totalCent: Math.round(amountEur * 100),
					allowLess,
				},
			})
				.then((order) => {
					setCheckoutState({
						isPending: false,
						isCompleted: true,
						isSuccess: true,
						data: order,
						error: undefined,
					});
					return order;
				})
				.catch((error) => {
					setCheckoutState({
						isPending: false,
						isCompleted: true,
						isSuccess: false,
						data: undefined,
						error,
					});
				}),
		[]
	);

	return { ...checkoutState, checkout };
};

export const useOrders = () => {
	return useSWR<GetOrdersResponse>(ORDERS_ENDPOINT, fetcher, {
		revalidateOnMount: true,
	});
};

export function ordersToTokens(orders: OrderOfProject[]): TokenRowProps[] {
	return orders.map((order) => {
		const tokenAmount =
			order.quantityInDecimal / Math.pow(10, order.project.tokenDecimals);
		const valueInEur =
			(order.quantityInDecimal * order.project.tokenPrice) /
			Math.pow(10, order.project.tokenDecimals);
		return {
			id: order.id,
			purchasedAt: new Date(order.createdAt),
			amount: tokenAmount,
			initialEurValue: valueInEur,
			totalPaid: order.amount,
			project: order.project,
			orderStatus: order.status,
		};
	});
}

export const useUserTokens = () => {
	const response = useOrders();
	const tokens = ordersToTokens(response?.data?.orders ?? []);

	return {
		...response,
		data: tokens,
	};
};

export const useUserSettings = () => {
	const { isAuthenticated } = useUser();
	const { data, isLoading, isValidating, error, mutate } = useSWR<Settings>(
		isAuthenticated ? USER_SETTINGS_ENDPOINT : null,
		fetcher
	);
	const update = useCallback(
		async (newPreferences: any) => {
			const newSettings = await axios({
				url: USER_SETTINGS_ENDPOINT,
				method: 'POST',
				data: {
					preferences: newPreferences,
				},
			});
			await mutate(newSettings);
		},
		[mutate]
	);

	return { data, isLoading, isValidating, error, mutate, update };
};

export const useMyTokenClaims = (): SWRResponse<MyTokenClaimsResponse> => {
	return useSWR<MyTokenClaimsResponse>(
		`${USER_TOKEN_CLAIMS_ENDPOINT}/by-project`,
		fetcher,
		{
			revalidateOnMount: true,
		}
	);
};

export const useProjectTokenClaim = (
	projectSlug: string
): SWRResponse<TokenClaim[]> => {
	const { data: project } = useProject(projectSlug);
	const myTokenClaimsResult = useMyTokenClaims();
	const data: TokenClaim[] = myTokenClaimsResult.data
		? myTokenClaimsResult.data.filter(
				(claim) => claim.projectSlug === projectSlug
		  )
		: [];
	const totalQuantityInDecimal = data
		? data.reduce((acc, { quantityInDecimal }) => {
				acc += Number(quantityInDecimal);
				return acc;
		  }, 0)
		: 0;
	const amount = project
		? getTokenAmount(totalQuantityInDecimal, project)
		: 0;

	const claim = useCallback(async () => {
		await axios({
			url: `${USER_TOKEN_CLAIMS_ENDPOINT}/by-project/${projectSlug}/use`,
			method: 'POST',
			data: {},
		});
		await myTokenClaimsResult?.mutate?.();
	}, [projectSlug, myTokenClaimsResult?.mutate]);

	return {
		...myTokenClaimsResult,
		claim,
		amount,
		data,
	};
};

export const useMyReferralInfo = () => {
	return useSWR<MyReferralInfoResponse>(
		`${MY_INFO_ENDPOINT}/referral`,
		fetcher,
		{
			revalidateOnMount: true,
		}
	);
};
