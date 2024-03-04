import prisma from '../../../lib/prismadb';
import {
	Body,
	Catch,
	createHandler,
	Get,
	Put,
	Query,
	Req,
} from 'next-api-decorators';
import RequiresAuth from '../../../helpers/api/requires-auth';
import { exceptionHandler } from '../../../lib/error';
import {
	dispatchNotification,
	toPublicNotifications,
} from '../../../lib/notifications';
import type { NextApiRequest } from 'next';
import { NotificationsResponse } from '@diversifiedfinance/types';
import { NotificationCreateDTO } from '../../../dto/notifications';

@RequiresAuth()
@Catch(exceptionHandler)
class NotificationsHandler {
	// GET /api/notifications
	@Get()
	public async listNotifications(
		@Req() req: NextApiRequest,
		@Query('page') cursor: string | null,
		@Query('limit') limit: number = 50
	): Promise<NotificationsResponse> {
		// const user = await getUser(req);
		const take = Number(limit);
		const notifications = await prisma.notification.findMany({
			where: {
				recipientId: req.nextauth?.token.sub,
			},
			take,
			skip: cursor ? 1 : 0,
			...(cursor && {
				cursor: {
					id: cursor,
				},
			}),
			orderBy: {
				visibleAt: 'desc',
			},
		});
		const nextCursor =
			notifications.length < take
				? null
				: notifications[notifications.length - 1].id;
		return {
			cursor: nextCursor || null,
			data: (notifications ?? []).map(toPublicNotifications),
		};
	}

	// PUT /api/notifications
	@Put()
	public async addNotification(
		@Body() body: NotificationCreateDTO,
		@Req() req: NextApiRequest
	): Promise<{ ok: 1 }> {
		await dispatchNotification(
			{
				type: 'marketing_general',
				recipientId: req.nextauth?.token.sub,
				content: body.content,
				status: 'pushed',
			},
			{ translate: false }
		);
		return {
			ok: 1,
		};
	}
}

export default createHandler(NotificationsHandler);
