import {
	FiatWallet,
	NotificationType,
	OrderOfProject,
	TokenClaim,
	Wallet,
} from './diversified';
import type { Prices } from './prices';
import type { bankAccount } from 'mangopay2-nodejs-sdk';
import type { Project } from './project';

export interface WalletResponse {
	fiat: FiatWallet[];
	credits: FiatWallet[];
	web3: Wallet[];
}

export interface PricesResponse {
	currency: string;
	prices: Prices;
}

export interface GetOrdersResponse {
	orders: OrderOfProject[];
}

export interface UserExistResponse {
	exists: boolean;
}

export interface ActivationCodeCheckResponse {
	valid: boolean;
}

export type BankAccountsResponse = Array<{
	id: string;
	label?: string;
	ibanData: bankAccount.IBANData;
}>;

export interface NotificationsResponse {
	data: NotificationType[];
	cursor: string | null;
}

export type NotificationPreferencesResponse = {
	[Key in NotificationType]?: boolean;
};

export interface TokenPriceHistory {
	prices: Prices;
	currency: string;
	project: Pick<Project, 'id' | 'slug' | 'title'>;
	token: {
		symbol: string;
		name: string;
		decimals: number;
		introductionPrice: number;
		maxSupplyInDecimal: number;
	};
}

export interface TokensPriceHistoryResponse {
	data: Array<{
		prices: Prices;
		currency: string;
		project: Pick<Project, 'id' | 'slug' | 'title'>;
		token: {
			symbol: string;
			name: string;
			decimals: number;
			introductionPrice: number;
			maxSupplyInDecimal: number;
		};
	}>;
}

export type MyTokenClaimsResponse = Array<TokenClaim>;

export interface MyReferralInfoResponse {
	referralCount: number;
	referralTurnedCustomerCount: number;
}
