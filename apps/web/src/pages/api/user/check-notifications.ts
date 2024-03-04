import { Catch, createHandler, Post, Req } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import RequiresAuth from '../../../helpers/api/requires-auth';
import type { NextApiRequest } from 'next';
import prisma from '../../../lib/prismadb';

@RequiresAuth()
@Catch(exceptionHandler)
class CheckNotificationsHandler {
	// POST /api/user/check-notifications
	@Post()
	public async checkNotifications(
		@Req() req: NextApiRequest
	): Promise<{ ok: 1 }> {
		try {
			await prisma.user.update({
				where: {
					id: req.nextauth?.token.sub,
					OR: [
						{
							notificationsLastOpened: null,
						},
						{
							notificationsLastOpened: {
								// ignore if it was updated less than 3 seconds ago
								lte: new Date(Date.now() - 3 * 1000),
							},
						},
					],
				},
				data: {
					notificationsLastOpened: new Date(),
				},
			});
		} catch (err) {
			// fail silently
		}
		return { ok: 1 };
	}
}

export default createHandler(CheckNotificationsHandler);
