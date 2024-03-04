import type { PaymentOption } from './types';
import type { card } from 'mangopay2-nodejs-sdk';
import { Platform } from 'react-native';

export const isPaymentOptionValid = (
	paymentOption: PaymentOption | undefined,
	cards?: card.CardData[],
	{
		applepayEnabled = Platform.OS === 'ios',
	}: { applepayEnabled: boolean } = {}
) => {
	if (!paymentOption) {
		return false;
	}
	if (paymentOption.paymentMethod === 'applepay') {
		return applepayEnabled;
	}
	if (paymentOption.paymentMethod === 'card') {
		return Boolean(
			paymentOption.cardId &&
				(!cards ||
					!!cards.find(({ Id }) => Id === paymentOption.cardId))
		);
	}
	if (paymentOption.paymentMethod === 'iban') {
		return false;
	}
};
