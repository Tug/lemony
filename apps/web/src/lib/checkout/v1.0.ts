import prisma, {
	Decimal,
	OrderForProject,
	Prisma,
	ProjectForCheckout,
	SchemaTypes,
	UserWithWallets,
} from '../prismadb';
import { CheckoutDTO } from '../../dto/checkout';
import { I18n } from '@diversifiedfinance/app/lib/i18n';
import { getPaymentContextForUser } from '../payment/client';
import { CheckoutError } from '../error';
import {
	decimalToMangopayMoney,
	getNetAmountAndFeesV1_deprecated,
	mangopayMoneyToDecimal,
} from '../payment/utils';
import { getOrCreateOrder, updateOrder } from './order';
import { FundsSourceType } from '@prisma/client';
import Mangopay from 'mangopay2-nodejs-sdk';
import {
	executeTransfer,
	findRecentTransferForOrder,
	getTransfer,
} from '../payment';
import { initiateCreditTransferUnchecked } from '../payment/credits';
import { processPendingOrder } from '../payment/cron';
import { crowdfundProject } from './index';

export async function checkoutV1(
	user: UserWithWallets,
	checkoutPayload: CheckoutDTO,
	project: ProjectForCheckout,
	reqContext: { i18n: I18n; apiVersion: string }
): Promise<SchemaTypes.Order> {
	const i18n = reqContext.i18n;
	const { mangoClient, useSandbox } = getPaymentContextForUser(user);
	const projectWalletId = useSandbox
		? project.sandboxMangopayWalletId
		: project.mangopayWalletId;
	if (!projectWalletId) {
		throw new CheckoutError(
			i18n.t(`Project does not have a mango account for payment`),
			'PROJECT_MANGO_WALLET_MISSING'
		);
	}
	if (!project.crowdfundingStateId) {
		throw new CheckoutError(
			i18n.t(`Project is not yet ready for sale.`),
			'PROJECT_NOT_CONFIGURED'
		);
	}
	if (project.failed) {
		throw new CheckoutError(
			i18n.t(`Project is not available for sale.`),
			'CROWDFUNDING_OVER'
		);
	}
	const transferData = {
		toWalletId: projectWalletId,
		amountInCent: checkoutPayload.totalCent,
		useCredits: checkoutPayload.useCredits,
	};
	let amountDecimal = mangopayMoneyToDecimal(checkoutPayload.totalCent);
	// TODO: find a way to automatically have a 2 decimal precision with decimal.js
	const { netAmount } = getNetAmountAndFeesV1_deprecated(
		mangopayMoneyToDecimal(checkoutPayload.totalCent),
		project
	);
	// TODO: unify with getTokenQuantityInDecimal
	// eslint-disable-next-line @diversifiedfinance/no-unused-vars-before-return
	const tokenQuantityInDecimal = netAmount
		.mul(Math.pow(10, project.tokenDecimals))
		.dividedBy(project.tokenPrice)
		.round()
		.toNumber();
	// make sure it's the same exact Order otherwise we need
	// to create a new one for idempotency support
	const order = await getOrCreateOrder(
		{
			userId: user.id,
			projectId: project.id,
			amount: amountDecimal,
			quantityInDecimal: tokenQuantityInDecimal,
			fundsSource: checkoutPayload.useCredits
				? FundsSourceType.FREE_CREDITS
				: FundsSourceType.WALLET_EUR,
		},
		{ useSandbox }
	);
	if (
		order.status === 'paid' ||
		order.status === 'prepaid' ||
		order.status === 'processed' ||
		order.status === 'preprocessed'
	) {
		throw new CheckoutError(
			i18n.t(`Order is already confirmed.`),
			'PAYMENT_DONE',
			{
				orderId: order.id,
			}
		);
	}
	if (order.status === 'errored') {
		throw new CheckoutError(
			i18n.t(`Order failed, please try again.`),
			'PAYMENT_FAILED',
			{ orderId: order.id }
		);
	}
	let transfer: Mangopay.transfer.TransferData | undefined;
	// paymentId is present when we want to get information
	// about a pending mangopay transfer
	if (order.paymentId) {
		transfer = await getTransfer(user, order.paymentId);
		// check if transfer is pending or failed
		if (transfer) {
			let orderStatus: SchemaTypes.OrderStatus;
			if (transfer.Status === 'SUCCEEDED') {
				orderStatus = project.isPresale ? 'prepaid' : 'paid';
			} else if (transfer.Status === 'FAILED') {
				orderStatus = 'errored';
			} else {
				orderStatus = 'pending';
			}
			const updatedOrder = await updateOrder(
				order.id,
				transfer,
				orderStatus,
				{
					useSandbox,
				}
			);
			if (transfer.Status === 'FAILED') {
				throw new CheckoutError(
					i18n.t(`Error returned from our payment service provider.`),
					'PSP_FAILURE',
					{
						orderId: order.id,
						psp: {
							txId: transfer.Id,
							message: transfer.ResultMessage,
							code: transfer.ResultCode,
						},
					}
				);
			}
			return updatedOrder;
		}
		throw new CheckoutError(
			i18n.t(`Fund transfer failed. Please start over`),
			'PAYMENT_FAILED',
			{
				orderId: order.id,
			}
		);
	}

	// TODO: improve concurrency:
	//  Cockroach DB only supports Serializable isolation level
	//  Advantages:
	//   - Strong guarantees
	//  Disadvantages:
	//  - Transaction may be aborted and will need to be resubmitted.
	//  - Performance might suffer
	//  See:
	//  - https://www.prisma.io/docs/guides/performance-and-optimization/prisma-client-transactions-guide#optimistic-concurrency-control
	//  - https://www.prisma.io/dataguide/intro/database-glossary#isolation-levels
	try {
		transfer = await prisma.$transaction(
			async (tx): Promise<Mangopay.transfer.TransferData> => {
				const amountCrowdfunded = await crowdfundProject(
					project,
					netAmount,
					{
						allowLess: !!checkoutPayload.allowLess,
						useSandbox,
						reqContext,
						orderId: order.id,
					},
					tx
				);

				// recompute total amount with fees
				if (amountCrowdfunded.lt(netAmount)) {
					amountDecimal = new Decimal(
						amountCrowdfunded
							.div(
								new Decimal(1).sub(project.feesPercent.div(100))
							)
							.toFixed(2)
					);
				}

				if (checkoutPayload.useCredits) {
					try {
						// unchecked credit transfer as the receiver is a project not another user
						// The mangopay transfer is done between the propco wallet and the project wallet
						await initiateCreditTransferUnchecked(
							user.id,
							amountDecimal,
							tx
						);
					} catch (error) {
						throw new CheckoutError(
							error?.message ??
								i18n.t(
									'Amount is greater than the user available free credits'
								),
							'NOT_ENOUGH_CREDITS'
						);
					}
				}

				const mangoTransfer = await executeTransfer(
					user,
					{
						...transferData,
						amountInCent: decimalToMangopayMoney(amountDecimal),
					},
					order.id,
					`Order ${order.id} for external user ${user.id}`,
					undefined,
					'PAYER',
					tx
				);
				if (mangoTransfer.Status === 'FAILED') {
					console.error(
						'Error while executing transfer',
						mangoTransfer
					);
					// Rollback transaction and exit early
					// No need to update the order row, the client will retry anyway
					throw new CheckoutError(
						i18n.t(
							`Error returned from our payment service provider.`
						),
						'PSP_FAILURE',
						{
							orderId: order.id,
							psp: {
								txId: mangoTransfer.Id,
								message: mangoTransfer.ResultMessage,
								code: mangoTransfer.ResultCode,
							},
						}
					);
				}
				return mangoTransfer;
			},
			{
				maxWait: 10000,
				timeout: 15000,
				isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
			}
		);
	} catch (error) {
		// https://www.prisma.io/docs/reference/api-reference/error-reference
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2034') {
				throw new CheckoutError(
					i18n.t(`Retrying...`),
					'TRANSACTION_RETRY_SERIALIZABLE',
					{
						orderId: order.id,
					}
				);
			}
			// "Transaction API error: {error}"
			// this can happen if we query the database using `prisma` (the main prisma client)
			// during the transaction, in which case it will cause a deadlock and the transaction
			// will timeout
			if (error.code === 'P2028') {
				console.error(error);
				// transfer could have happened successfully during
				// the transaction but the transaction timed out or closed for some reason
				// see: https://github.com/prisma/prisma/issues/13713
				// In this case we won't have the transfer object to attach to the order
				// Let's try to find the successful transfer in mangopay
				transfer =
					(await findRecentTransferForOrder(order, {
						useSandbox,
					})) ?? undefined;
			}
		}
		if (!transfer) {
			throw error;
		}
	}

	let updatedOrder: OrderForProject | null;

	// first assign payment id to order and current payment status
	updatedOrder = await updateOrder(order.id, transfer, 'pending', {
		useSandbox,
	});

	// try to call mango one more time to see if the transaction completed
	// otherwise let the client try again
	if (transfer.Status === 'CREATED' && transfer.Id) {
		transfer = await mangoClient.Transfers.get(transfer.Id);
	}

	// then if transfer is completed (succeded or failed) run post actions immediately
	if (transfer.Status !== 'CREATED') {
		updatedOrder = await processPendingOrder(transfer, {
			useSandbox,
		});
	}

	return updatedOrder ?? order;
}
