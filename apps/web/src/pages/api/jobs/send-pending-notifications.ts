import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import { Catch, createHandler, Get } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { sendPendingNotifications } from '../../../lib/notifications';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

@RequiresAPIKEY()
@Catch(exceptionHandler)
class SendPushNotificationsHandler {
	@Get()
	public async sendAllPending(): Promise<{ ok: 1 }> {
		await sendPendingNotifications();
		return { ok: 1 };
	}
}

export default createHandler(SendPushNotificationsHandler);
