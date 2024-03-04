import { IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CredentialsDTO {
	@IsOptional()
	// make sure the phone number's format is /^\+\d+$/g (if given)
	@Transform(({ value }) =>
		value ? value.replace(/^[^+]|(?<!^)\D+/g, '') : value
	)
	phoneNumber?: string;

	@IsOptional()
	// make sure the email address is lowercase (if given)
	@Transform(({ value }) => (value ? value.trim().toLowerCase() : value))
	email?: string;

	@IsOptional()
	activationCode?: string;
}

export class MagicAuthCredentialsDTO extends CredentialsDTO {
	@IsNotEmpty()
	didToken: string;
}

export class OTPCredentialsDTO extends CredentialsDTO {
	@IsNotEmpty()
	code: string;
}

export class UserAccountVerifyDTO {
	@IsOptional()
	code: string;

	@IsOptional()
	reassign: boolean;

	@IsOptional()
	verificationToken: string;
}

export class UserAccountVerifyEmailDTO extends UserAccountVerifyDTO {
	email: string;
}

export class UserAccountVerifyPhoneNumberDTO extends UserAccountVerifyDTO {
	phoneNumber: string;
}
