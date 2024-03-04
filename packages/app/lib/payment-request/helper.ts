import { Platform } from 'react-native';
import i18n from '@diversifiedfinance/app/lib/i18n';
import { PaymentRequest } from './index';
import { v4 as uuidv4 } from 'uuid';

export interface PaymentDetails {
	label: string;
	amountTotal: number;
	fees?: number;
	amountWithoutFees?: number;
}

const sanitizedMoneyNumber = (value: number) => Math.round(value * 100) / 100;

export function createPaymentRequest(
	{ label, fees = 0, amountWithoutFees, amountTotal }: PaymentDetails,
	{
		useSandbox = false,
		currencyCode = 'EUR',
		countryCode = 'FR',
		supportedNetworks = ['visa', 'mastercard'], // 'amex'
	}: {
		useSandbox?: boolean;
		currencyCode?: string;
		countryCode?: string;
		supportedNetworks?: string[];
	} = {}
) {
	if (fees === 0) {
		amountWithoutFees = amountTotal;
	} else if (!amountWithoutFees) {
		amountWithoutFees = amountTotal - fees;
	}
	const methodData = [
		(Platform.OS === 'ios' || Platform.OS === 'web') && {
			supportedMethods:
				Platform.OS === 'ios'
					? ['apple-pay']
					: 'https://apple.com/apple-pay',
			data: {
				version: 12,
				merchantIdentifier: useSandbox
					? process.env.NEXT_PUBLIC_APPLE_PAY_MERCHANT_ID_SANDBOX
					: process.env.NEXT_PUBLIC_APPLE_PAY_MERCHANT_ID,
				merchantCapabilities: [
					'supports3DS',
					'supportsCredit',
					'supportsDebit',
				],
				supportedNetworks,
				countryCode,
				currencyCode,
				// https://developers.google.com/android/reference/com/google/android/gms/wallet/WalletConstants.html
				// PAYMENT_METHOD_CARD and PAYMENT_METHOD_TOKENIZED_CARD.. or [1, 2]
				environment: useSandbox ? 'sandbox' : 'production',
				// 	paymentMethodTokenizationParameters: {
				// 		tokenizationType: 'NETWORK_TOKEN', // or GATEWAY_TOKEN
				// 		parameters: {
				// 			publicKey: 'your-pubic-key', // https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography#using-openssl
				// 			//  if use GATEWAY_TOKEN
				// 			//  gateway: 'your gateway',
				// 			//  gatewayMerchantId: 'your gatewayMerchantId',
				// 			//  merchantName: 'your merchantName',
				// 		},
				// 	},
			},
		},
		Platform.OS === 'android' && {
			supportedMethods: ['android-pay'],
			data: {
				environment: useSandbox ? 'sandbox' : 'production',
				paymentMethodTokenizationParameters: {
					tokenizationType: 'NETWORK_TOKEN',
					parameters: {
						publicKey: 'your-pubic-key',
					},
				},
				supportedNetworks,
				countryCode,
				currencyCode,
			},
		},
	].filter(Boolean);

	const details = {
		id: uuidv4(),
		displayItems: [
			{
				label,
				amount: {
					currency: 'EUR',
					value: sanitizedMoneyNumber(amountWithoutFees),
				},
			},
			fees > 0 && {
				label: i18n.t('Fees'),
				amount: {
					currency: 'EUR',
					value: sanitizedMoneyNumber(fees ?? 0),
				},
			},
		].filter(Boolean),
		total: {
			label: 'Diversified',
			amount: {
				currency: 'EUR',
				value: sanitizedMoneyNumber(amountTotal),
			},
		},
	};
	return new PaymentRequest(methodData, details);
}
