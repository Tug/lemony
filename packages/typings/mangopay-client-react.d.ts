declare module 'mangopay-client-react' {
	class Client {
		constructor(
			clientId: string,
			clientPassword: string,
			userId: string,
			baseURL: string,
			version: string
		);
		static mangoPayClient: Client;
		static getInstance(
			clientId?: string,
			clientPassword?: string = '',
			userId?: string = '',
			baseURL?: string,
			version?: string
		);
		getCards(): Promise<any>;
		cardRegisterationProcesses({
			currencyCode,
			cardNumber,
			cardType,
			cardExpirationDate,
			cardCvx,
		}): Promise<any>;
		getCardRegisterationData({
			tag,
			currencyCode,
			cardType,
		}: {
			tag?: string;
			currencyCode: string;
			cardType: string;
		}): Promise<any>;
		registerCard(cardRegisterData, cardData): Promise<any>;
		deactivateCard(cardId: string): Promise<any>;
	}
	export default Client;
}
