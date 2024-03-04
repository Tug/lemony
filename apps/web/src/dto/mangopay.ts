import Mangopay from 'mangopay2-nodejs-sdk';
import {
	IsIn,
	IsNotEmpty,
	IsNotEmptyObject,
	IsObject,
	IsOptional,
	IsString,
	Max,
	Min,
	ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CardRegistrationDTO {
	@IsIn([
		'CB_VISA_MASTERCARD',
		'DINERS',
		'MASTERPASS',
		'MAESTRO',
		'P24',
		'IDEAL',
		'BCMC',
		'PAYLIB',
	])
	cardType: Mangopay.card.CardType;
}

export class CreditOwnWalletWithCardDTO {
	@IsNotEmpty()
	cardId: string;

	@Min(0)
	amountCent: number;

	@IsIn(['EUR'])
	currency: Mangopay.CurrencyISO;

	@IsObject()
	browserInfo: Mangopay.base.BrowserInfoData;
}

class PaymentRequestPaymentData {
	@IsString()
	@IsNotEmpty()
	transactionId: string;

	@IsString()
	@IsIn(['VISA', 'MASTERCARD'])
	network: 'VISA' | 'MASTERCARD'; // | 'AMEX';

	@IsString()
	@IsNotEmpty()
	tokenData: string;
}

export class CreditOwnWalletWithPaymentRequestDTO {
	@IsNotEmpty()
	paymentType: 'APPLE_PAY' | 'GOOGLE_PAY';

	@Min(0)
	amountCent: number;

	@IsIn(['EUR'])
	currency: Mangopay.CurrencyISO;

	@IsNotEmptyObject()
	@IsObject()
	@ValidateNested()
	@Type(() => PaymentRequestPaymentData)
	paymentData!: PaymentRequestPaymentData;
}

export class AddBankAccountDTO {
	@IsNotEmpty()
	@Transform(({ value }) => (value ? value.replace(/\s/g, '') : value))
	iban: string;

	@IsNotEmpty()
	@Transform(({ value }) => (value ? value.replace(/\s/g, '') : value))
	bic: string;

	@IsOptional()
	label: string;
}

export class EditBankAccountDTO {
	@IsOptional()
	label: string;
}

export class BankAccountPayoutDTO {
	@Min(0)
	amountCent: number;

	@IsIn(['EUR'])
	currency: Mangopay.CurrencyISO;

	@IsOptional()
	label: string;

	@IsOptional()
	instant: boolean;
}
