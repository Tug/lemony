import type { NextApiRequest } from 'next';
import {
	Catch,
	createHandler,
	Delete,
	Get,
	Param,
	Req,
} from 'next-api-decorators';
import { getUser } from '../../../../../lib/auth';
import RequiresAuth from '../../../../../helpers/api/requires-auth';
import { exceptionHandler } from '../../../../../lib/error';
import { deactivateUserCard, getUserCards } from '../../../../../lib/payment';
import { card } from 'mangopay2-nodejs-sdk';

@RequiresAuth()
@Catch(exceptionHandler)
class CardsHandler {
	// GET /api/payment/mangopay/cards
	@Get()
	public async list(
		@Req() req: NextApiRequest
	): Promise<Array<card.CardData & { isLastUsed: boolean }>> {
		const userId = req.nextauth.token.sub;
		const user = await getUser(userId);
		return getUserCards(user);
	}

	// DELETE /api/payment/mangopay/cards/:cardId
	@Delete('/:cardId')
	public async removeCard(
		@Param('cardId') cardId: string,
		@Req() req: NextApiRequest
	): Promise<{ ok: 1 }> {
		const userId = req.nextauth.token.sub;
		const user = await getUser(userId);
		await deactivateUserCard(user, cardId);
		return { ok: 1 };
	}
}

export default createHandler(CardsHandler);
