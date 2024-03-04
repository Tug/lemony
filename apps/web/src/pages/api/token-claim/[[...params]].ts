import prisma, {
	SchemaTypes,
	UserTokenClaimWithProject,
} from '../../../lib/prismadb';
import type { NextApiRequest } from 'next';
import {
	Body,
	Catch,
	createHandler,
	Get,
	Param,
	Post,
	Req,
	SetHeader,
	ValidationPipe,
} from 'next-api-decorators';
import RequiresAuth from '../../../helpers/api/requires-auth';
import { UserInfoUpdateDTO } from '../../../dto/userinfo';
import { exceptionHandler } from '../../../lib/error';
import {
	claimToken,
	getUserTokenClaims,
	toPublicTokenClaim,
} from '../../../lib/token-claim';
import {
	Order as PublicOrder,
	TokenClaim,
} from '@diversifiedfinance/types/diversified';
import { toPublicOrder } from '../../../lib/orders';
import { getUser } from '../../../lib/auth';

@RequiresAuth()
@Catch(exceptionHandler)
class TokenClaimHandler {
	// GET /api/token-claim
	@Get('/')
	@SetHeader('Cache-Control', 'nostore')
	public async listTokenClaims(
		@Req() req: NextApiRequest
	): Promise<TokenClaim[]> {
		const userId = req.nextauth.token.sub;
		const user = await getUser(userId);
		const userTokenClaims = await getUserTokenClaims(user);
		// TODO: remove this reduce
		const tokenClaims = userTokenClaims.reduce((result, tokenClaim) => {
			const existingTokenClaim = result.find(
				(tc) => tc.pool.projectId === tokenClaim.pool.projectId
			);
			if (!existingTokenClaim) {
				result.push(tokenClaim);
			} else {
				// this is a big int addition
				existingTokenClaim.quantityInDecimal =
					existingTokenClaim.quantityInDecimal +
					tokenClaim.quantityInDecimal;
			}
			return result;
		}, [] as UserTokenClaimWithProject[]);
		return tokenClaims.map(toPublicTokenClaim);
	}

	@Get('/by-project')
	@SetHeader('Cache-Control', 'nostore')
	public async listTokenClaimsGroupByProject(
		@Req() req: NextApiRequest
	): Promise<TokenClaim[]> {
		const userId = req.nextauth.token.sub;
		const user = await getUser(userId);
		const userTokenClaims = await getUserTokenClaims(user);
		const tokenClaims = userTokenClaims.reduce((result, tokenClaim) => {
			const existingTokenClaim = result.find(
				(tc) => tc.pool.projectId === tokenClaim.pool.projectId
			);
			if (!existingTokenClaim) {
				result.push(tokenClaim);
			} else {
				// this is a big int addition
				existingTokenClaim.quantityInDecimal =
					existingTokenClaim.quantityInDecimal +
					tokenClaim.quantityInDecimal;
			}
			return result;
		}, [] as UserTokenClaimWithProject[]);
		return tokenClaims.map(toPublicTokenClaim);
	}

	// POST /api/token-claim/:tokenClaimId/use
	@Post('/:tokenClaimId/use')
	public async useTokenClaim(
		@Param('tokenClaimId') tokenClaimId: string,
		@Req() req: NextApiRequest
	): Promise<{ ok: number; order: PublicOrder }> {
		const userId = req.nextauth.token.sub;
		const user = await getUser(userId);
		const order = await claimToken(user, tokenClaimId);
		return {
			ok: 1,
			order: toPublicOrder(order),
		};
	}

	// POST /api/token-claim/by-project/:projectSlug/use
	@Post('/by-project/:projectIdOrSlug/use')
	public async useAllTokenClaimsForProject(
		@Param('projectIdOrSlug') projectIdOrSlug: string,
		@Req() req: NextApiRequest,
		@Body(ValidationPipe) body: UserInfoUpdateDTO
	): Promise<{ ok: number; orders: PublicOrder[] }> {
		const userId = req.nextauth.token.sub;
		const user = await getUser(userId);
		const userTokenClaims = await getUserTokenClaims(user, projectIdOrSlug);
		const orders = [];
		for (const tokenClaim of userTokenClaims) {
			orders.push(await claimToken(user, tokenClaim.id));
		}
		return {
			ok: 1,
			orders: orders.map(toPublicOrder),
		};
	}
}

export default createHandler(TokenClaimHandler);
