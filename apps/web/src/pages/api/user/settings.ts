import {
	Get,
	Body,
	Catch,
	createHandler,
	Post,
	ValidationPipe,
	Req,
} from 'next-api-decorators';
import prisma, { Prisma } from '../../../lib/prismadb';
import { exceptionHandler } from '../../../lib/error';
import { UserSettingsUpdateDTO } from '../../../dto/userinfo';
import type { NextApiRequest } from 'next';
import { getUserFromDB } from '../../../lib/auth';
import RequiresAuth from '../../../helpers/api/requires-auth';
import type { Settings } from '@diversifiedfinance/types/diversified';

@RequiresAuth()
@Catch(exceptionHandler)
class UserSettingsHandler {
	// GET /api/user/settings
	@Get()
	public async getSettings(@Req() req: NextApiRequest): Promise<Settings> {
		const user = await getUserFromDB(req);
		return (user.settings ?? {}) as Settings;
	}

	@Post()
	public async updateSettings(
		@Req() req: NextApiRequest,
		@Body(ValidationPipe) body: UserSettingsUpdateDTO
	): Promise<{ ok: 1 }> {
		const user = await getUserFromDB(req);
		const settings = {
			// cannot overwrite settings at the moment
			// TODO: audit paymentSandbox change, this could be an exploit if users can change it themselves
			...(user.settings ?? {}),
			preferences: {
				...user.settings?.preferences,
				...body.preferences,
			},
		};
		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				settings,
				// overwrite locale used for external communication when app language is changed
				...(settings.preferences.locale &&
					settings.preferences.locale !== user.locale && {
						locale: settings.preferences.locale,
					}),
			},
		});
		return settings;
	}
}

export default createHandler(UserSettingsHandler);
