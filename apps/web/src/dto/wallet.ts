import { IsOptional } from 'class-validator';

export class AddMagicWalletDTO {
	didToken: string;

	@IsOptional()
	replace: boolean;

	@IsOptional()
	email: string;

	@IsOptional()
	phoneNumber: string;

	@IsOptional()
	providerAccessToken: string;

	@IsOptional()
	providerScope: string[];

	@IsOptional()
	reassign?: boolean;

	// backwards compatibility
	@IsOptional()
	reassign_wallet?: boolean;
}
