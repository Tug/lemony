import type { NextApiRequest } from 'next';
import {
	Body,
	Catch,
	createHandler,
	NotFoundException,
	Post,
	Req,
	ValidationPipe,
} from 'next-api-decorators';
import { getCardRegistrationData } from '../../../../lib/payment';
import { CardRegistrationDTO } from '../../../../dto/mangopay';
import { getUser } from '../../../../lib/auth';
import RequiresAuth from '../../../../helpers/api/requires-auth';
import { exceptionHandler } from '../../../../lib/error';
import { CardRegisterData } from 'mangopay-cardregistration-js-kit';

@RequiresAuth()
@Catch(exceptionHandler)
class CardRegistrationHandler {
	// POST /api/payment/mangopay/card-registration
	@Post()
	public async create(
		@Body(ValidationPipe) body: CardRegistrationDTO,
		@Req() req: NextApiRequest
	): Promise<CardRegisterData> {
		const userId = req.nextauth.token.sub;
		const user = await getUser(userId);
		const cardRegistrationData = await getCardRegistrationData(user, body);
		return {
			Id: cardRegistrationData.Id,
			cardRegistrationURL: cardRegistrationData.CardRegistrationURL,
			preregistrationData: cardRegistrationData.PreregistrationData,
			accessKey: cardRegistrationData.AccessKey,
		};
	}
}

export default createHandler(CardRegistrationHandler);
