import type { NextApiRequest } from 'next';
import { createHandler, Get, Query, Req } from 'next-api-decorators';
import { handleHookPayload } from '../../../../lib/payment/hook';
import { event as MangopayEventNS } from 'mangopay2-nodejs-sdk';

type EventType = MangopayEventNS.EventType;

class MangopayPayloadHandler {
	// GET /api/payment/mangopay/payload
	@Get()
	public async payload(
		@Query('EventType') eventType: EventType,
		@Query('RessourceId') resourceId: string,
		@Query('Date') timestamp: string,
		@Req() req: NextApiRequest
	): Promise<{ ok: 1 }> {
		if (resourceId === 'SYSTEM_BOOT') {
			return { ok: 1 };
		}
		try {
			await handleHookPayload({
				eventType,
				resourceId,
				timestamp: Number(timestamp),
			});
		} catch (err) {
			console.error('Error handling hook payload', err);
		}
		return { ok: 1 };
	}
}

export default createHandler(MangopayPayloadHandler);
