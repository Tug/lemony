import prisma from '../../../../lib/prismadb';
import {
	Catch,
	createHandler,
	Body,
	ValidationPipe,
	Post,
	Req,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../../lib/error';
import { DeviceTokenCreateDTO } from '../../../../dto/notifications';
import RequiresAuth from '../../../../helpers/api/requires-auth';
import type { NextApiRequest } from 'next';
import { initNotificationPreferences } from '../../../../lib/notifications';
import { trackV2 } from '@diversifiedfinance/app/lib/customerio/client.web';

const platforms = [undefined, 'expo', 'web', 'ios', 'android'];

@RequiresAuth()
@Catch(exceptionHandler)
class DeviceNotificationsHandler {
	// POST /api/notifications/device/token
	@Post('/token')
	public async registerToken(
		@Body(ValidationPipe) body: DeviceTokenCreateDTO,
		@Req() req: NextApiRequest
	): Promise<{ ok: 1 }> {
		const userId = req.nextauth.token.sub;
		const platform: string | undefined =
			!Number.isNaN(body.platform) && platforms[body.platform as number]
				? platforms[body.platform as number]
				: (body.platform as string);
		const token = body.token;
		if (!platform) {
			throw new Error('Invalid platform type');
		}
		if (!token) {
			throw new Error('Invalid token');
		}
		// don't return an error to the client yet as we don't know if it can handle it
		try {
			await prisma.deviceToken.createMany({
				data: [
					{
						userId,
						platform,
						token,
					},
				],
				skipDuplicates: true,
			});
			if (platform !== 'expo') {
				const userAgent = req.headers['user-agent'] ?? '';
				const agentMatches = userAgent.match(
					/Diversified\/([\d\\.]+) (.*)\/([\d\\.]+) (.*)\/([\d\\.]+)/
				);
				const diversifiedVersion = agentMatches?.[1];
				trackV2({
					type: 'person',
					identifiers: {
						id: userId,
					},
					action: 'add_device',
					device: {
						token,
						platform,
						last_used: Math.round(Date.now() / 1000),
						attributes: {
							app_version: diversifiedVersion,
							push_enabled: 'true',
						},
					},
				});
			}
			await initNotificationPreferences(userId);
		} catch (err) {
			console.error(err);
		}
		return { ok: 1 };
	}
}

export default createHandler(DeviceNotificationsHandler);
