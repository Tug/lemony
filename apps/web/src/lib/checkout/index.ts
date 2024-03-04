import { CheckoutDTO } from '../../dto/checkout';
import prisma, {
	UserWithWallets,
	SchemaTypes,
	ProjectForCheckout,
	projectForCheckoutIncludes,
	Prisma,
} from '../prismadb';
import { Decimal } from 'decimal.js';
import { CheckoutError } from '../error';
import type { I18n } from '@diversifiedfinance/app/lib/i18n';
import { checkoutV1 } from './v1.0';
import { checkoutV101 } from './v1.01';

export async function getProjectForCheckout(
	user: UserWithWallets,
	checkoutPayload: CheckoutDTO,
	reqContext: { i18n: I18n }
): Promise<ProjectForCheckout> {
	const i18n = reqContext.i18n;
	if (user.kycStatus !== 'completed') {
		throw new CheckoutError(
			i18n.t(
				'Your account is unverified. Please follow the KYC procedure before investing.'
			),
			'USER_UNVERIFIED'
		);
	}
	// if (checkoutPayload.totalCent / 100 < MIN_AMOUNT_EUR) {
	// 	throw new CheckoutError(
	// 		i18n.t(`The minimum accepted amount is {{min_amount}}`, {
	// 			min_amount: printMoney(MIN_AMOUNT_EUR),
	// 		}),
	// 		'AMOUNT_TOO_LOW',
	// 		{
	// 			limits: {
	// 				MIN_AMOUNT_EUR,
	// 				MAX_AMOUNT_EUR,
	// 			},
	// 		}
	// 	);
	// }
	const project = await prisma.project.findUniqueOrThrow({
		where: { id: checkoutPayload.projectId },
		include: projectForCheckoutIncludes,
	});
	if (
		project.crowdfundingState.collectedAmount.gte(
			project.crowdfundingState.maximumAmount
		)
	) {
		throw new CheckoutError(
			i18n.t(`Project is fully sold out.`),
			'CROWDFUNDING_OVER'
		);
	}
	return project;
}

export async function crowdfundProject(
	project: SchemaTypes.Project,
	netAmount: Decimal.Value,
	{
		useSandbox = false,
		allowLess = false,
		orderId = undefined,
		reqContext: { i18n },
	}: {
		useSandbox: boolean;
		allowLess: boolean;
		orderId?: string;
		reqContext: { i18n: I18n };
	} = {},
	tx: Prisma.TransactionClient = prisma
): Promise<Decimal> {
	let crowdfundingState;
	try {
		crowdfundingState = await tx.projectCrowdfundingState.findUniqueOrThrow(
			{
				where: {
					id: project.crowdfundingStateId,
					collectedAmount: {
						lt: project.targetPrice,
					},
				},
			}
		);
	} catch (err) {
		throw new CheckoutError(
			i18n.t(`Project is fully sold out.`),
			'CROWDFUNDING_OVER',
			{
				orderId,
			}
		);
	}
	let newCollectedAmount = Decimal.add(
		crowdfundingState.collectedAmount,
		netAmount
	);
	if (newCollectedAmount.gt(crowdfundingState.maximumAmount)) {
		if (allowLess) {
			newCollectedAmount = crowdfundingState.maximumAmount;
			// take everything left
			netAmount = crowdfundingState.maximumAmount.sub(
				crowdfundingState.collectedAmount
			);
		} else {
			throw new CheckoutError(
				i18n.t(
					`The amount of token left for sale is less than the amount you ordered. Do you wish to buy all that is available? (Currently remaining: {{amountLeft}})`,
					{
						amountLeft: `${crowdfundingState.maximumAmount
							.sub(crowdfundingState.collectedAmount)
							.div(10)
							.toNumber()} DIFIED`,
					}
				),
				'CROWDFUNDING_OVERFLOW',
				{
					orderId,
					crowdfundingState,
				}
			);
		}
	}
	if (!useSandbox) {
		await tx.projectCrowdfundingState.update({
			where: { id: project.crowdfundingStateId },
			data: {
				collectedAmount: newCollectedAmount,
			},
		});
	}
	return new Decimal(netAmount);
}

export async function checkout(
	user: UserWithWallets,
	checkoutPayload: CheckoutDTO,
	project: ProjectForCheckout,
	reqContext: { i18n: I18n; apiVersion?: string }
): Promise<SchemaTypes.Order> {
	// v1.01 consider `totalCent` to include the fee on the invested amount
	// totalCent = 10500 => 105.00 EUR paid => 100 EUR in tokens + 5 EUR in fees
	// For a 5% fee => Real fee is 5%
	if (reqContext.apiVersion === 'v1.01') {
		return checkoutV101(user, checkoutPayload, project, reqContext);
	}

	// v1.0 consider `totalCent` to include the fee on the total paid amount
	// totalCent = 10000 => 100.00 EUR paid => 95 EUR in tokens + 5 EUR in fees
	// For a 5% fee => Real fee is actually 5.26%
	return checkoutV1(user, checkoutPayload, project, reqContext);
}
