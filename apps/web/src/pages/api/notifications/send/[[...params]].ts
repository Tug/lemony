import {
	Body,
	Catch,
	createHandler,
	Param,
	Post,
	Req,
	UseMiddleware,
	ValidationPipe,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../../lib/error';
import type { NextApiRequest } from 'next';
import { requireAPIKeyMiddleware } from '../../../../helpers/api/requires-api-key';
import { SendNotificationCreateDTO } from '../../../../dto/notifications';
import { broadcastNotification } from '../../../../lib/notifications';
import prisma from '../../../../lib/prismadb';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@UseMiddleware(requireAPIKeyMiddleware(process.env.CRM_WEBHOOK_API_KEY))
@Catch(exceptionHandler)
class SendNotificationHandler {
	// POST /api/notifications/send/broadcast
	@Post('/broadcast')
	public async broadcast(
		@Body(ValidationPipe) body: SendNotificationCreateDTO,
		@Req() req: NextApiRequest
	): Promise<{ ok: 1 }> {
		const notification = {
			visibleAt: body.visibleAt ? new Date(body.visibleAt) : new Date(),
			content: body.content,
			type: body.type,
			imgUrl: body.imgUrl,
			author: {
				id: body.authorId,
			},
		};
		const labels = Array.isArray(body.labels)
			? body.labels
			: (body.labels ?? '').split(',');
		await broadcastNotification(notification, {
			...(labels.length > 0 && {
				AND: labels.map((id) => ({
					labels: {
						some: {
							label: {
								equals: id,
							},
						},
					},
				})),
			}),
		});
		return { ok: 1 };
	}

	// POST /api/notifications/send/user
	@Post('/user')
	public async sendToUser(
		@Body(ValidationPipe) body: SendNotificationCreateDTO,
		@Req() req: NextApiRequest
	): Promise<{ ok: 1 }> {
		if (!body.userId) {
			throw new Error('User id is required');
		}
		await prisma.notification.create({
			data: {
				authorId: body.authorId,
				recipientId: body.userId,
				visibleAt: body.visibleAt
					? new Date(body.visibleAt)
					: new Date(),
				content: body.content,
				type: body.type,
				imgUrl: body.imgUrl,
			},
		});
		return { ok: 1 };
	}
}

export default createHandler(SendNotificationHandler);
