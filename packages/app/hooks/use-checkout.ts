import { useProject } from '@diversifiedfinance/app/hooks/use-project';
import { useRef, useState } from 'react';
import {
	CheckoutErrorType,
	Order,
} from '@diversifiedfinance/types/diversified';
import { axios } from '@diversifiedfinance/app/lib/axios';
import { toMangopayMoneyType } from '@diversifiedfinance/app/lib/mangopay';
import { getLang } from '@diversifiedfinance/app/lib/i18n';
import { Alert } from '@diversifiedfinance/design-system/alert';
import { useTranslation } from 'react-i18next';

export interface ProductSelection {
	totalEur: number;
	fees: number;
	amountToken: number;
	projectSlug: string;
}

export interface Basket {
	products: ProductSelection[];
}

export const useCheckout = (
	projectSlug: string,
	{ maxRetryCount = 4 }: { maxRetryCount?: number } = {}
) => {
	const { t } = useTranslation();
	const { data: project } = useProject(projectSlug);
	const allowLess = useRef<boolean>(false);
	const [isPaying, setPaying] = useState<boolean>(false);
	const orderId = useRef<string | undefined>(undefined);
	const retryCount = useRef<number>(0);

	const resetOrder = () => {
		retryCount.current = 0;
		orderId.current = undefined;
		allowLess.current = false;
		setPaying(false);
	};

	const pay = async (basket: Basket): Promise<Order> => {
		const product = basket.products?.[0];
		if (!product || !project) {
			throw new Error('Project not loaded');
		}
		setPaying(true);
		const eurValue = product.totalEur;
		try {
			const order: Order = await axios({
				url: '/api/payment/checkout',
				method: 'post',
				data: {
					totalCent: toMangopayMoneyType(eurValue),
					currency: 'EUR',
					projectId: project.id,
					orderId: orderId.current,
					allowLess: allowLess.current,
					lang: getLang(),
					apiVersion: 'v1.01',
					useTokenClaim: false,
				},
			});
			if (
				order.status === 'errored' ||
				(order.status === 'pending' &&
					retryCount.current >= maxRetryCount)
			) {
				throw new Error('Order failed, please try again.');
			}
			if (order.status === 'pending') {
				orderId.current = order.id;
				retryCount.current++;
				return pay(basket);
			}
			return order;
		} catch (err) {
			const errorMessage =
				err.response?.data?.error ??
				err?.ResultMessage ??
				err.message ??
				err.toString();
			const errorType: CheckoutErrorType = err.response?.data?.type;
			const errorOrderId = err.response?.data?.context?.orderId;
			orderId.current = errorOrderId;
			if (
				errorType === 'TRANSACTION_RETRY_SERIALIZABLE' &&
				retryCount.current < maxRetryCount
			) {
				retryCount.current++;
				return pay(basket);
			}
			if (errorType === 'CROWDFUNDING_OVERFLOW') {
				return new Promise<Order>((resolve) => {
					Alert.alert(t('Error'), errorMessage, [
						{
							text: t('Cancel'),
							style: 'destructive',
							onPress: () => {
								orderId.current = undefined;
								throw new Error('Cancelled by user');
							},
						},
						{
							text: t('Accept'),
							style: 'cancel',
							onPress: () => {
								allowLess.current = true;
								resolve(pay(basket));
							},
						},
					]);
				});
			}
			throw new Error(errorMessage);
		} finally {
			resetOrder();
		}
	};

	return { pay, isPaying };
};
