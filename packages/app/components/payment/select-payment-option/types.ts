import { PaymentMethod } from '../select-payment-method/types';

export interface PaymentOption {
	paymentMethod: PaymentMethod;
	cardId?: string;
}
