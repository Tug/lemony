import {
	Body,
	Catch,
	createHandler,
	Post,
	Req,
	ValidationPipe,
} from 'next-api-decorators';
import { CheckoutDTO } from '../../../dto/checkout';
import { getUser } from '../../../lib/auth';
import RequiresAuth from '../../../helpers/api/requires-auth';
import { CheckoutError, exceptionHandler } from '../../../lib/error';
import { checkout, getProjectForCheckout } from '../../../lib/checkout';
import {
	decimalToMangopayMoney,
	mangopayMoneyToDecimal,
} from '../../../lib/payment/utils';
import type { Order as PublicOrder } from '@diversifiedfinance/types/diversified';
import { toPublicOrder } from '../../../lib/orders';
import prisma, {
	SchemaTypes,
	Decimal,
	userWithWalletsIncludes,
} from '../../../lib/prismadb';
import WithTranslation from '../../../helpers/api/with-translation';
import WithApiVersion from '../../../helpers/api/with-api-version';
import type { I18NMiddlewareContext } from '../../../helpers/api/with-translation';
import type { APIVersionMiddlewareContext } from '../../../helpers/api/with-api-version';
import type { NextApiRequestWithContext } from '../../../helpers/api/request-with-contexts';
import { claimToken, getUserTokenClaims } from '../../../lib/token-claim';

export const config = {
	maxDuration: 20, // 20s max duration
};

@RequiresAuth()
@WithTranslation()
@WithApiVersion()
@Catch(exceptionHandler)
class CheckoutHandler {
	// POST /api/payment/checkout
	@Post()
	public async checkout(
		@Body(ValidationPipe) body: CheckoutDTO,
		@Req()
		req: NextApiRequestWithContext<
			I18NMiddlewareContext & APIVersionMiddlewareContext
		>
	): Promise<PublicOrder> {
		const reqContext = req.context;
		const i18n = reqContext.i18n;
		// TODO: reactivate this and also check that the project remaining amount is not less than MIN_AMOUNT_EUR
		// if (body.totalCent < decimalToMangopayMoney(MIN_AMOUNT_EUR)) {
		// 	throw new CheckoutError(
		// 		i18n.t('You must invest at least {{amount}}', {
		// 			amount: printMoney(MIN_AMOUNT_EUR),
		// 		}),
		// 		'AMOUNT_TOO_LOW'
		// 	);
		// }
		// if (body.totalCent > decimalToMangopayMoney(MAX_AMOUNT_EUR)) {
		// 	throw new CheckoutError(
		// 		i18n.t('You cannot invest more than {{amount}} at once', {
		// 			amount: printMoney(MAX_AMOUNT_EUR),
		// 		}),
		// 		'AMOUNT_TOO_HIGH'
		// 	);
		// }
		const userId = req.nextauth.token.sub;
		const user = await getUser(userId);
		if (body.useTokenClaim) {
			const tokensClaims = await getUserTokenClaims(user, body.projectId);
			let lastOrder = null;
			if (tokensClaims.length > 0) {
				for (const tokenClaim of tokensClaims) {
					lastOrder = await claimToken(user, tokenClaim.id);
				}
			}
			if (body.totalCent === 0) {
				if (lastOrder) {
					return toPublicOrder(lastOrder);
				}
				throw new Error('Invalid order');
			}
		}
		// Order is important here, getProjectForCheckout checks if project is fully crowdfunded
		// Token claim can happen on crowdfunded projects
		const project = await getProjectForCheckout(user, body, reqContext);
		if (project.isPresale) {
			const bankAccountsCount = await prisma.userBankAccount.count({
				where: { userId, disabled: false },
			});
			if (bankAccountsCount === 0) {
				throw new CheckoutError(
					i18n.t('You must add a bank account before investing'),
					'BANK_DETAILS_MISSING'
				);
			}
		}
		let orderToReturn: SchemaTypes.Order;
		// if user has credits
		if (user.creditsEur.gt(0)) {
			const freeCreditsOrder = await checkout(
				user,
				{
					totalCent: decimalToMangopayMoney(
						Decimal.min(
							user.creditsEur,
							mangopayMoneyToDecimal(body.totalCent)
						)
					),
					currency: 'EUR',
					projectId: body.projectId,
					useCredits: true,
				},
				project,
				reqContext
			);
			orderToReturn = freeCreditsOrder;
			if (
				freeCreditsOrder.paymentStatus === 'SUCCEEDED' ||
				freeCreditsOrder.paymentStatus === 'CREATED'
			) {
				const remainingAmount = mangopayMoneyToDecimal(
					body.totalCent
				).sub(freeCreditsOrder.amount);
				if (remainingAmount.gt(0)) {
					// if status is created assume it will succeed and deduct from total amount
					const walletOrder = await checkout(
						user,
						{
							...body,
							useCredits: false,
							totalCent: decimalToMangopayMoney(remainingAmount),
						},
						project,
						reqContext
					);
					orderToReturn = walletOrder;
				}
			}
		} else {
			orderToReturn = await checkout(
				user,
				{ ...body, useCredits: false },
				project,
				reqContext
			);
		}

		return toPublicOrder(orderToReturn);
	}
}

export default createHandler(CheckoutHandler);
