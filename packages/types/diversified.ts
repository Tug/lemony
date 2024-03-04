// TODO: sync with prisma types

import { Project } from './project';

export interface Address {
	addressLine1: string;
	addressLine2: string | null;
	city: string;
	region: string | null;
	postalCode: string;
	country: Country;
}

export interface Country {
	code: string;
}

export interface Wallet {
	address: string;
	ownerId: string | null;
	isPrimary: boolean;
}

export interface IBAN {
	Type: 'IBAN';
	Country: string;
	OwnerName: string;
	Active: boolean;
	IBAN: string;
	BIC: string;
}

export interface FiatWallet {
	id: string;
	balance: number;
	currency: string;
	iban?: IBAN;
}

export interface Account {
	userId: string;
	type: string;
	provider: string;
}

export type UserRole = 'USER' | 'ADMIN' | 'SELLER';

export type KYCStatus =
	| 'init'
	| 'pending'
	| 'prechecked'
	| 'queued'
	| 'completed'
	| 'onHold'
	| 'failed'; // failed is not a value returned by sumsub

export type VIPLevelLabel =
	| 'user'
	| 'regular'
	| 'vip1'
	| 'vip2'
	| 'vip3'
	| 'vip4'
	| 'vip_affiliate'
	| 'vip_influencer'
	| 'vip_affiliate_custom'
	| 'vip_ama';

export type UserBenefits = {
	difiedPerReferral: number;
	xpPerDified: number;
	xpPerReferral: number;
};

export type VIPLevelBenefits = Record<VIPLevelLabel, UserBenefits>;

export type MyInfo = {
	data: {
		profile: Profile;
		providers: {
			sumsub?: {
				userId: string;
				token: string;
			};
			intercom?: {
				userHash?: string;
			};
		};
		settings: Settings;
		constants: {
			vipLevelBenefits: VIPLevelBenefits;
		};
		overrides: {
			project?: {
				feesPercent?: number;
			};
		};
	};
};

export interface Profile {
	profile_id: string;
	firstName?: string;
	lastName?: string;
	birthDate?: string | Date;
	nationality?: Country;
	countryOfResidence?: Country;
	address?: Address;
	disclaimerAccepted: boolean;
	termsAndConditionsAccepted: boolean;
	email?: string;
	phoneNumber?: string;
	emailVerified: boolean;
	phoneNumberVerified: boolean;
	image?: string;
	createdAt: string | Date;
	updatedAt: string | Date;
	disabled: boolean;
	role: UserRole;
	kycStatus?: KYCStatus;
	kycUpdatedAt?: string | Date;
	wallets?: Wallet[];
	accounts?: Account[];
	mangopayId?: string;
	locale?: string;
	labels?: string[];
	referralCode?: string;
	notificationsLastOpened?: string | Date;
	xp: number;
	leadSource?: string;
	hasSponsor?: boolean;
}

export interface Settings {
	paymentSandbox?: boolean;
	preferences?: {};
}

export interface Order {
	id: string;
	createdAt: string | Date;
	updatedAt: string | Date;
	projectId: string;
	userId: string;
	amount: number;
	currency: string;
	quantityInDecimal: number;
	paymentId: string | null;
	paymentStatus: 'CREATED' | 'SUCCEEDED' | 'FAILED' | null;
	status: 'pending' | 'prepaid' | 'paid' | 'processed' | 'errored';
}

export type OrderOfProject = Order & {
	project: Project;
};

export type CheckoutErrorType =
	| 'USER_UNVERIFIED'
	| 'AMOUNT_TOO_LOW'
	| 'AMOUNT_TOO_HIGH'
	| 'USER_MANGO_ACCOUNT_MISSING'
	| 'PROJECT_MANGO_ACCOUNT_MISSING'
	| 'USER_MANGO_WALLET_MISSING'
	| 'PROJECT_MANGO_WALLET_MISSING'
	| 'PROJECT_NOT_CONFIGURED'
	| 'ORDER_NOT_FOUND'
	| 'CROWDFUNDING_OVER'
	| 'CROWDFUNDING_OVERFLOW'
	| 'PSP_FAILURE'
	| 'PAYMENT_DONE'
	| 'PAYMENT_FAILED'
	| 'TRANSACTION_RETRY_SERIALIZABLE'
	| 'NOT_ENOUGH_CREDITS'
	| 'BANK_DETAILS_MISSING';

export type LoginErrorType =
	| 'BAD_REQUEST'
	| 'INVALID_CODE'
	| 'ACCOUNT_PENDING_DELETION';

export interface NotificationType {
	id: string;
	visibleAt: string | Date;
	imgUrl?: string;
	content?: any;
	type: string;
	author?: any;
}

export interface TokenClaim {
	id: string;
	userId: string;
	quantity: number;
	quantityInDecimal: number;
	createdAt: number | string | Date;
	expiresAt: number | string | Date;
	projectId: string;
	projectSlug: string;
	tokenName: string;
}
