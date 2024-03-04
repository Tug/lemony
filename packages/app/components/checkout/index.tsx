import { Checkout as CheckoutComponent } from './checkout';
import { createParam } from '@diversifiedfinance/app/navigation/lib/use-param';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useCallback, useState } from 'react';
import { BottomSheetScrollView } from '@diversifiedfinance/components/bottom-sheet-scroll-view';
import {
	ORDERS_ENDPOINT,
	PRICE_ENDPOINT,
	WALLETS_ENDPOINT,
} from '@diversifiedfinance/app/hooks/api-hooks';
import { useSWRConfig } from 'swr';
import { CheckoutSuccess } from '@diversifiedfinance/app/components/checkout/success';
import { Basket } from '@diversifiedfinance/app/hooks/use-checkout';
import { BottomSheetModalProvider } from '@diversifiedfinance/design-system/bottom-sheet';

const endpointsToRefresh = [
	'/api/feed/projects',
	'/api/project',
	PRICE_ENDPOINT,
	WALLETS_ENDPOINT,
	ORDERS_ENDPOINT,
];

export interface CheckoutProps {
	projectSlug?: string;
}

export function Checkout({ projectSlug }: CheckoutProps) {
	const [successBasket, setSuccessBasket] = useState<Basket | null>(null);
	const { mutate } = useSWRConfig();
	const router = useRouter();

	const onPaid = useCallback(
		async (basket: Basket) => {
			await mutate(
				(key) =>
					endpointsToRefresh.some((endpointRoute) =>
						key?.toString().startsWith(endpointRoute)
					),
				undefined,
				{ revalidate: true }
			);
			setSuccessBasket(basket);
		},
		[setSuccessBasket, mutate]
	);

	if (!projectSlug) {
		return null;
	}

	if (successBasket) {
		return (
			<BottomSheetScrollView>
				<CheckoutSuccess
					onAction={() => {
						router.pop();
						setSuccessBasket(null);
					}}
					basket={successBasket}
				/>
			</BottomSheetScrollView>
		);
	}

	return (
		<>
			<BottomSheetModalProvider>
				<BottomSheetScrollView>
					<CheckoutComponent
						projectSlug={projectSlug}
						onPaid={onPaid}
					/>
				</BottomSheetScrollView>
			</BottomSheetModalProvider>
		</>
	);
}
