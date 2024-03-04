import { PaymentOption } from '@diversifiedfinance/app/components/payment/select-payment-option/types';
import { useCards } from '@diversifiedfinance/app/hooks/api-hooks';
import { Platform } from 'react-native';
import { localPreferencesV2Atom } from '@diversifiedfinance/app/lib/preferences';
import { useAtom } from 'jotai';
import { isPaymentOptionValid } from '@diversifiedfinance/app/components/payment/select-payment-option/utils';

const preferredPaymentOptionAtom = localPreferencesV2Atom<PaymentOption | null>(
	'preferred-payment-option',
	null
);

export function usePreferredPaymentOption() {
	const [preferredPaymentOption, setPreferredPaymentOption] = useAtom(
		preferredPaymentOptionAtom
	);
	const { activeCard, data: cards, isLoading: isCardLoading } = useCards();
	const applepayEnabled = Platform.OS === 'ios';
	const defaultPaymentMethod = applepayEnabled
		? 'applepay'
		: activeCard
		? 'card'
		: undefined;
	const isValid =
		!isCardLoading &&
		cards &&
		preferredPaymentOption &&
		isPaymentOptionValid(preferredPaymentOption, cards, {
			applepayEnabled,
		});

	const paymentMethod = isValid
		? preferredPaymentOption.paymentMethod
		: defaultPaymentMethod;
	const cardId =
		paymentMethod === 'card'
			? isValid
				? preferredPaymentOption.cardId
				: activeCard?.Id
			: undefined;

	return {
		preferredPaymentOption: paymentMethod
			? {
					paymentMethod,
					cardId,
			  }
			: undefined,
		setPreferredPaymentOption,
	};
}
