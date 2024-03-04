declare module 'mangopay-cardregistration-js-kit' {
	export interface CardRegisterData {
		Id: string;
		cardRegistrationURL: string;
		preregistrationData: string;
		accessKey: string;
	}

	export type CardType =
		| 'CB_VISA_MASTERCARD'
		| 'DINERS'
		| 'MASTERPASS'
		| 'MAESTRO'
		| 'P24'
		| 'IDEAL'
		| 'BCMC'
		| 'PAYLIB'
		| 'AMEX'
		| 'UNKNOWN';
	export type CardStatus = 'CREATED' | 'VALIDATED' | 'ERROR';
	export type CardValidity = 'UNKNOWN' | 'VALID' | 'INVALID';

	export interface CardData {
		cardNumber: string;
		cardExpirationDate: string;
		cardCvx: string;
		cardType: CardType;
	}

	export interface ErrorData {
		xmlhttp: XMLHttpRequest;
		ResultCode: string;
		ResultMessage: string;
	}

	type SuccessCallback = (data: CardRegistrationData) => void;
	type ErrorCallback = (error: ErrorData) => void;

	export interface CardRegistrationData {
		Id: string;
		Tag: string;
		CreationDate: number;
		UserId: string;
		Currency: string;
		AccessKey: string;
		PreregistrationData: string;
		CardRegistrationURL: string;
		RegistrationData: string;
		CardType: CardType;
		CardId: string;
		ResultCode: '000000';
		ResultMessage: string;
		Status: CardStatus;
	}

	interface MangoPayCardRegistrationKit {
		cardRegistration: {
			baseURL: string;
			clientId: string;
			init: (cardRegisterData: CardRegisterData) => void;
			registerCard: (
				cardData: CardData,
				successCallback: SuccessCallback,
				errorCallback: ErrorCallback
			) => void;
		};
	}

	const kit: MangoPayCardRegistrationKit;

	export default kit;
}
