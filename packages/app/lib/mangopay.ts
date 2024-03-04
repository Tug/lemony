import { axios } from './axios';
import MangoPayKit, {
	CardRegisterData,
	CardData,
	CardType,
	CardRegistrationData,
	CardType as MangoCardType,
} from 'mangopay-cardregistration-js-kit';
import type { card, payIn } from 'mangopay2-nodejs-sdk';
import {
	CardDetails,
	CreditCardInputCardType,
} from '@diversifiedfinance/components/credit-card-input';
import { MyInfo } from '@diversifiedfinance/types/diversified';
import i18n, { getLang } from '@diversifiedfinance/app/lib/i18n';
import { printMoney } from '@diversifiedfinance/app/lib/money';
import { createPaymentRequest } from '@diversifiedfinance/app/lib/payment-request/helper';

export interface BrowserInfoData {
	AcceptHeader: string;
	JavaEnabled: boolean;
	Language: string;
	ColorDepth: number;
	ScreenHeight: number;
	ScreenWidth: number;
	JavascriptEnabled: boolean;
	TimeZoneOffset: string;
	UserAgent: string;
}

const cardTypeToMangopay: {
	[cardType in CreditCardInputCardType]: MangoCardType;
} = {
	amex: 'AMEX',
	dankort: 'UNKNOWN',
	hipercard: 'UNKNOWN',
	dinersclub: 'DINERS',
	discover: 'UNKNOWN',
	jcb: 'UNKNOWN',
	laser: 'UNKNOWN',
	maestro: 'MAESTRO',
	mastercard: 'CB_VISA_MASTERCARD',
	unionpay: 'UNKNOWN',
	visaelectron: 'CB_VISA_MASTERCARD',
	visa: 'CB_VISA_MASTERCARD',
	elo: 'UNKNOWN',
};

export const brandToCardType = (brand?: CreditCardInputCardType): CardType => {
	return brand ? cardTypeToMangopay[brand] : 'UNKNOWN';
};

export const cardDetailsToCardData = (cardDetails?: CardDetails): CardData => {
	if (!cardDetails || !cardDetails.number) {
		throw new Error(i18n.t('Card number is missing'));
	}
	if (!cardDetails.expiry) {
		throw new Error(i18n.t('Expiry date missing'));
	}
	if (!cardDetails.cvc) {
		throw new Error(i18n.t('CVC is missing'));
	}
	const cardType = brandToCardType(cardDetails.brand);
	if (!cardType) {
		throw new Error('Unsupported card');
	}
	return {
		cardNumber: cardDetails.number.replace(/\D/g, ''),
		cardExpirationDate: cardDetails.expiry.replace(/\D/g, ''),
		cardCvx: cardDetails.cvc.trim(),
		cardType,
	};
};

export async function registerCard(
	user: MyInfo,
	cardDetails?: CardDetails
): Promise<CardRegistrationData> {
	const cardData = cardDetailsToCardData(cardDetails);

	const cardRegisterData: CardRegisterData = await axios({
		method: 'POST',
		url: '/api/payment/mangopay/card-registration',
		data: {
			cardType: cardData.cardType,
		},
	});

	const useSandbox = Boolean(user.data.settings?.paymentSandbox);
	MangoPayKit.cardRegistration.baseURL = useSandbox
		? process.env.NEXT_PUBLIC_MANGOPAY_SANDBOX_BASE_URL
		: process.env.NEXT_PUBLIC_MANGOPAY_BASE_URL;
	MangoPayKit.cardRegistration.clientId = useSandbox
		? process.env.NEXT_PUBLIC_MANGOPAY_SANDBOX_CLIENT_ID
		: process.env.NEXT_PUBLIC_MANGOPAY_CLIENT_ID;
	MangoPayKit.cardRegistration.init(cardRegisterData);

	return new Promise((resolve, reject) => {
		MangoPayKit.cardRegistration.registerCard(cardData, resolve, (err) => {
			console.error(MangoPayKit.cardRegistration, err);
			if (err.ResultMessage) {
				return reject(new Error(err.ResultMessage));
			}
			reject(
				new Error(
					'Error while trying to register your card to mangopay'
				)
			);
		});
	});
}

export async function creditEurWalletWithCard({
	cardId,
	amountEur,
	browserInfo,
}: {
	cardId: string;
	amountEur: number;
	browserInfo: BrowserInfoData;
}): Promise<payIn.CardDirectPayInData> {
	return await axios({
		method: 'POST',
		url: '/api/payment/mangopay/credit-wallet',
		data: {
			cardId,
			amountCent: toMangopayMoneyType(amountEur),
			currency: 'EUR',
			browserInfo,
		},
		params: {
			lang: getLang(),
		},
	});
}

export async function payWithCard(cardId: string) {
	await axios({
		method: 'POST',
		url: '/api/payment/checkout',
		data: {
			cardId,
		},
		params: {
			lang: getLang(),
		},
	});
}

export function updateCardRegistration(
	cardRegistrationObject,
	registrationData
) {
	return axios({
		url: '/api/update-card-registration',
		method: 'POST',
		data: {
			card_registration_object: {
				...cardRegistrationObject,
				RegistrationData: registrationData,
			},
		},
	});
}

export function toMangopayMoneyType(amountInEur: number): number {
	return Math.round(100 * amountInEur);
}

export function fromMangopayMoney(amountInCent: number = 0): number {
	return amountInCent / 100;
}

export function printMangopayMoney(amountInCent: number = 0): string {
	return printMoney(fromMangopayMoney(amountInCent));
}

export { printMoney };

export function cardToString(cardData?: card.CardData): string {
	if (!cardData) {
		return '';
	}
	let cardType = '';
	if (cardData.CardType === 'CB_VISA_MASTERCARD') {
		cardType = cardData.Alias.charAt(0) === '4' ? 'Visa' : 'Mastercard';
	} else {
		cardType = cardData.CardType.charAt(0) + cardData.CardType.slice(1);
	}
	return `${cardType} •••• ${cardData.Alias.slice(-4)}`;
}

export const creditEurWalletWithPaymentRequest = async ({
	amountEur,
	useSandbox,
}: {
	amountEur: number;
	useSandbox: boolean;
}) => {
	const paymentRequest = createPaymentRequest({
		label: i18n.t('Credit account'),
		amountTotal: amountEur,
		useSandbox,
	});
	// this can throw
	const paymentResponse = await paymentRequest.show();
	const paymentType = paymentResponse.methodName
		.toUpperCase()
		.replace('-', '_');
	const transactionId = paymentResponse.requestId;
	let {
		paymentToken,
		getPaymentToken,
		paymentMethod: { network },
		paymentData,
	} = paymentResponse.details;
	// console.log(
	// 	'paymentResponse.details',
	// 	transactionId,
	// 	paymentResponse.details
	// );
	// paymentToken only set for stripe or Braintree gateway
	if (!paymentToken) {
		// android returns getPaymentToken and no paymentToken
		if (getPaymentToken) {
			paymentToken = await getPaymentToken();
		}
		if (paymentData && !paymentToken) {
			paymentToken =
				typeof paymentData === 'string'
					? paymentData
					: JSON.stringify(paymentData);
			// paymentToken = JSON.stringify({
			// 	version: paymentData.header?.version,
			// 	data: paymentData.data,
			// 	publicKeyHash: paymentData.header?.publicKeyHash,
			// 	transactionId: paymentData.header?.transactionId,
			// });
		}
	}
	if (!paymentToken) {
		paymentResponse.complete('fail');
		throw new Error('Payment token not found');
	}
	console.log('data', {
		paymentType,
		paymentData: {
			transactionId,
			network: network.toUpperCase(),
			tokenData: paymentToken,
		},
		amountCent: toMangopayMoneyType(amountEur),
		currency: 'EUR',
	});
	try {
		const creditWalletResponse = await axios({
			method: 'POST',
			url: '/api/payment/mangopay/credit-wallet/payment-request',
			data: {
				paymentType,
				paymentData: {
					transactionId,
					network: network.toUpperCase(),
					tokenData: paymentToken,
				},
				amountCent: toMangopayMoneyType(amountEur),
				currency: 'EUR',
			},
			params: {
				lang: i18n.language,
			},
		});
		paymentResponse.complete('success');
		return {
			paymentResponse,
			creditWalletResponse,
		};
	} catch (err) {
		paymentResponse.complete('fail');
		throw err;
	}
};
