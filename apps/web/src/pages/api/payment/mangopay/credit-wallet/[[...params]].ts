import type { NextApiRequest } from 'next';
import {
	BadRequestException,
	Body,
	Catch,
	createHandler,
	Post,
	Req,
	UnauthorizedException,
	ValidationPipe,
} from 'next-api-decorators';
import {
	CreditOwnWalletWithCardDTO,
	CreditOwnWalletWithPaymentRequestDTO,
} from '../../../../../dto/mangopay';
import { getUser } from '../../../../../lib/auth';
import RequiresAuth from '../../../../../helpers/api/requires-auth';
import { CheckoutError, exceptionHandler } from '../../../../../lib/error';
import {
	creditOwnWalletWithCard,
	creditOwnWalletWithPaymentRequest,
} from '../../../../../lib/payment';
import Mangopay from 'mangopay2-nodejs-sdk';
import { decimalToMangopayMoney } from '../../../../../lib/payment/utils';
import {
	MAX_AMOUNT_EUR_CREDIT_CARD,
	MIN_AMOUNT_EUR_CREDIT_CARD,
} from '@diversifiedfinance/app/lib/constants';
import { printMoney } from '@diversifiedfinance/app/lib/money';
import WithTranslation from '../../../../../helpers/api/with-translation';
import type { NextApiRequestWithTranslationContext } from '../../../../../helpers/api/with-translation';

export const config = {
	maxDuration: 20, // 20s max duration
};

@RequiresAuth()
@WithTranslation()
@Catch(exceptionHandler)
class CreditWalletHandler {
	// POST /api/payment/mangopay/credit-wallet
	@Post()
	public async creditWithCard(
		@Body(ValidationPipe) body: CreditOwnWalletWithCardDTO,
		@Req() req: NextApiRequestWithTranslationContext
	): Promise<Mangopay.payIn.CardDirectPayInData> {
		const userId = req.nextauth.token.sub;
		const user = await getUser(userId);
		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		const forwarded = req.headers['x-forwarded-for'];
		const ipAddress = forwarded
			? forwarded.toString().split(/, /)[0]
			: req.socket.remoteAddress;
		if (!ipAddress) {
			throw new BadRequestException('IP address missing');
		}
		const i18n = req.context.i18n;
		if (
			body.amountCent < decimalToMangopayMoney(MIN_AMOUNT_EUR_CREDIT_CARD)
		) {
			throw new Error(
				i18n.t('Minimum amount by credit card is {{amount}}', {
					amount: printMoney(MIN_AMOUNT_EUR_CREDIT_CARD),
				})
			);
		}
		if (
			body.amountCent > decimalToMangopayMoney(MAX_AMOUNT_EUR_CREDIT_CARD)
		) {
			throw new Error(
				i18n.t('Maximum amount by credit card is {{amount}}', {
					amount: printMoney(MAX_AMOUNT_EUR_CREDIT_CARD),
				})
			);
		}
		const payin = await creditOwnWalletWithCard({
			...body,
			user,
			ipAddress,
		});
		if (__DEV__) {
			console.log('payin', payin);
		}
		return payin;
	}

	// POST /api/payment/mangopay/credit-wallet/payment-request
	@Post('/payment-request')
	public async creditWithPaymentRequest(
		@Body(ValidationPipe) body: CreditOwnWalletWithPaymentRequestDTO,
		@Req() req: NextApiRequestWithTranslationContext
	): Promise<Mangopay.payIn.CardDirectPayInData> {
		const userId = req.nextauth.token.sub;
		const user = await getUser(userId);
		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		return await creditOwnWalletWithPaymentRequest({
			...body,
			user,
		});
	}
}

export default createHandler(CreditWalletHandler);
