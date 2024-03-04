import { IsIn, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import Mangopay from 'mangopay2-nodejs-sdk';

export class CheckoutDTO {
	// not supported yet, the total amount must be on the user's wallet
	cardId?: string;

	@Min(0)
	totalCent: number;

	@IsIn(['EUR'])
	currency: Mangopay.CurrencyISO;

	@IsNotEmpty()
	projectId: string;

	@IsOptional()
	orderId?: string;

	@IsOptional()
	allowLess?: boolean;

	@IsOptional()
	useCredits?: boolean;

	@IsOptional()
	useTokenClaim?: boolean;

	@IsOptional()
	lang?: string;

	@IsOptional()
	apiVersion?: string = 'v1.0';
}
