import { Catch, createHandler, Get, Req } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import RequiresAuth from '../../../helpers/api/requires-auth';
import type { NextApiRequest } from 'next';
import { getUser } from '../../../lib/auth';
import { getUserTokens } from '../../../lib/price/token';

export async function getMeResponse(userId: string): Promise<any> {
	const user = await getUser(userId);
	const tokens = await getUserTokens(user.id);
	return {
		id: user.id,
		profile: {
			firstName: user.firstName ?? undefined,
			lastName: user.lastName ?? undefined,
			name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
			termsAndConditionsAccepted: Boolean(
				user.termsAndConditionsAcceptedAt &&
					user.privacyPolicyAcceptedAt
			),
			disclaimerAccepted: Boolean(user.disclaimerAcceptedAt),
			email: user.email ?? undefined,
			phoneNumber: user.phoneNumber ?? undefined,
			emailVerified: Boolean(user.emailVerified),
			phoneNumberVerified: Boolean(user.phoneNumberVerified),
			createdAt: user.createdAt.toString(),
			updatedAt: user.updatedAt.toString(),
			disabled: user.disabled,
			kycStatus: user.kycStatus ?? undefined,
			kycUpdatedAt: user.kycUpdatedAt?.toString(),
			locale: user.locale ?? undefined,
			role: user.role,
		},
		tokens,
	};
}

@RequiresAuth()
@Catch(exceptionHandler)
class MeHandler {
	// GET /api/me
	@Get('/')
	public async registerToken(@Req() req: NextApiRequest): Promise<any> {
		return await getMeResponse(req.nextauth?.token.sub);
	}

	// GET /api/me/tokens
	@Get('/tokens')
	public async listUserTokens(@Req() req: NextApiRequest): Promise<any> {
		return {
			data: await getUserTokens(req.nextauth?.token.sub),
		};
	}
}

export default createHandler(MeHandler);
