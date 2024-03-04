import { HttpException } from 'next-api-decorators';

export class CannabisException extends HttpException {
	public verificationToken?: string;

	public constructor(
		message: string = 'Enhance your calm',
		verificationToken?: string
	) {
		super(420, message);
		this.verificationToken = verificationToken;
	}
}
