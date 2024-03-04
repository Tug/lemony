import Mangopay from 'mangopay2-nodejs-sdk';
import assert from 'assert';
import { v4 } from 'uuid';
import { SchemaTypes, UserForCheckout } from '../prismadb';

export type { Mangopay };

export const Mango = (() => {
	const getDefaultClient = ({
		useSandbox = false,
	}: {
		useSandbox?: boolean;
	} = {}): Mangopay => {
		if (useSandbox) {
			return getSandboxClient();
		}
		return getProductionClient();
	};

	const getProductionClient = (): Mangopay => {
		assert(
			process.env.NEXT_PUBLIC_MANGOPAY_CLIENT_ID,
			'NEXT_PUBLIC_MANGOPAY_CLIENT_ID env variable is missing'
		);
		// it's fine to have it empty in dev
		// assert(
		// 	process.env.MANGOPAY_CLIENT_PASSWORD,
		// 	'MANGOPAY_CLIENT_PASSWORD env variable is missing'
		// );
		assert(
			process.env.NEXT_PUBLIC_MANGOPAY_BASE_URL,
			'NEXT_PUBLIC_MANGOPAY_BASE_URL env variable is missing'
		);
		return new Mangopay({
			clientId: process.env.NEXT_PUBLIC_MANGOPAY_CLIENT_ID,
			clientApiKey: process.env.MANGOPAY_CLIENT_PASSWORD,
			baseUrl: process.env.NEXT_PUBLIC_MANGOPAY_BASE_URL,
		});
	};

	const getSandboxClient = (): Mangopay => {
		assert(
			process.env.NEXT_PUBLIC_MANGOPAY_SANDBOX_CLIENT_ID,
			'MANGOPAY_SANDBOX_CLIENT_ID env variable is missing'
		);
		assert(
			process.env.MANGOPAY_SANDBOX_CLIENT_PASSWORD,
			'MANGOPAY_SANDBOX_CLIENT_PASSWORD env variable is missing'
		);
		assert(
			process.env.NEXT_PUBLIC_MANGOPAY_SANDBOX_BASE_URL,
			'NEXT_PUBLIC_MANGOPAY_SANDBOX_BASE_URL env variable is missing'
		);
		return new Mangopay({
			clientId: process.env.NEXT_PUBLIC_MANGOPAY_SANDBOX_CLIENT_ID,
			clientApiKey: process.env.MANGOPAY_SANDBOX_CLIENT_PASSWORD,
			baseUrl: process.env.NEXT_PUBLIC_MANGOPAY_SANDBOX_BASE_URL,
		});
	};

	const getIdempotencyOptions = (options?: any, idempotencyKey?: string) => {
		return (getDefaultClient() as any).OptionsHelper.withIdempotency(
			options ?? {},
			idempotencyKey ?? v4()
		);
	};

	return {
		getDefaultClient,
		getProductionClient,
		getSandboxClient,
		getIdempotencyOptions,
	};
})();

interface PaymentContext {
	mangopayUserId: string | null;
	mangopayWalletId: string | null;
	mangopayCreditsWalletId: string | null;
	mangoClient: Mangopay;
	useSandbox: boolean;
	mangopayUserIdKey: 'sandboxMangopayId' | 'mangopayId';
	mangopayWalletIdKey: 'sandboxMangopayWalletId' | 'mangopayWalletId';
	mangopayCreditsWalletIdKey:
		| 'sandboxMangopayCreditsWalletId'
		| 'mangopayCreditsWalletId';
	mangopayActiveCardId: string;
}

export function getPaymentContextForUser(
	user: UserForCheckout,
	settingsOverride?: any
): PaymentContext {
	const userSettings = {
		...user.settings,
		...settingsOverride,
	};
	const useSandbox = Boolean(userSettings.paymentSandbox);
	const mangopayUserIdKey = useSandbox ? 'sandboxMangopayId' : 'mangopayId';
	const mangopayWalletIdKey = useSandbox
		? 'sandboxMangopayWalletId'
		: 'mangopayWalletId';
	const mangopayCreditsWalletIdKey = useSandbox
		? 'sandboxMangopayCreditsWalletId'
		: 'mangopayCreditsWalletId';
	return {
		mangopayUserId: user[mangopayUserIdKey],
		mangopayWalletId: user[mangopayWalletIdKey],
		mangopayCreditsWalletId: user[mangopayCreditsWalletIdKey],
		mangoClient: Mango.getDefaultClient({ useSandbox }),
		useSandbox,
		mangopayUserIdKey,
		mangopayWalletIdKey,
		mangopayCreditsWalletIdKey,
		mangopayActiveCardId: user.mangopayActiveCardId,
	};
}
