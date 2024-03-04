import prisma from '../../../lib/prismadb';
import { Catch, createHandler, Get, Query, Req } from 'next-api-decorators';
import RequiresAuth from '../../../helpers/api/requires-auth';
import { exceptionHandler } from '../../../lib/error';
import { toPublicNotifications } from '../../../lib/notifications';
import type { NextApiRequest } from 'next';
import { NotificationsResponse } from '@diversifiedfinance/types';

@Catch(exceptionHandler)
class NotificationsHandler {
	// GET /api/notifications/local
	@Get()
	public async listLocalNotifications(
		@Req() req: NextApiRequest
	): Promise<NotificationsResponse> {
		return {
			cursor: null,
			data: [
				{
					id: 'new-user-1',
					visibleAt: '',
					imgUrl: null,
					type: 'system_local',
					author: {
						id: null,
					},
				},
				{
					id: 'new-user-1',
					visibleAt: new Date(),
					imgUrl: null,
					content: {
						title: 'Welcome to Diversified Finance!',
						description: 'We are excited to have you here!',
					},
					type: 'system_local',
					author: {
						id: null,
					},
				},
			],
		};
	}
}

export default createHandler(NotificationsHandler);
