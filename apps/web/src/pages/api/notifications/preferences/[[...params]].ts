import {
	Catch,
	createHandler,
	Body,
	Req,
	Patch,
	Get,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../../lib/error';
import RequiresAuth from '../../../../helpers/api/requires-auth';
import type { NextApiRequest } from 'next';
import { NotificationPreferencesResponse } from '@diversifiedfinance/types';
import { initNotificationPreferences } from '../../../../lib/notifications';
import prisma from '../../../../lib/prismadb';

@RequiresAuth()
@Catch(exceptionHandler)
class NotificationPreferencesHandler {
	// GET /api/notifications/preferences/push
	@Get('/push')
	public async getNotificationsPreferences(
		@Req() req: NextApiRequest
	): Promise<NotificationPreferencesResponse> {
		// TODO: REMOVE temporary hack to init notif pref while testing
		await initNotificationPreferences(req.nextauth?.token.sub);
		const notificationPreferences =
			await prisma.notificationPreference.findMany({
				where: {
					userId: req.nextauth?.token.sub,
				},
			});
		return notificationPreferences.reduce((result, pref) => {
			result[pref.notificationType] = pref.enabled;
			return result;
		}, {});
	}

	// PATCH /api/notifications/preferences/push
	@Patch('/push')
	public async updateNotificationsPreference(
		@Body() body: any,
		@Req() req: NextApiRequest
	): Promise<{ ok: 1 }> {
		for (const [notificationType, enabled] of Object.entries(body)) {
			// Body is unchecked
			if (
				typeof notificationType !== 'string' ||
				typeof enabled !== 'boolean'
			) {
				continue;
			}
			await prisma.notificationPreference.upsert({
				where: {
					userId_notificationType: {
						userId: req.nextauth?.token.sub,
						notificationType,
					},
				},
				update: {
					enabled,
				},
				create: {
					userId: req.nextauth?.token.sub,
					notificationType,
					enabled,
				},
			});
		}
	}
}

export default createHandler(NotificationPreferencesHandler);
