import { TokenClaimCheckout } from './token-claim-checkout';
import { createParam } from '@diversifiedfinance/app/navigation/lib/use-param';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useCallback, useState } from 'react';
import { BottomSheetScrollView } from '@diversifiedfinance/components/bottom-sheet-scroll-view';
import {
	ORDERS_ENDPOINT,
	USER_TOKEN_CLAIMS_ENDPOINT,
} from '@diversifiedfinance/app/hooks/api-hooks';
import { useSWRConfig } from 'swr';
import { TokenClaimCheckoutSuccess } from './success';
import type { TokenClaim } from '@diversifiedfinance/types/diversified';
import { BottomSheetModalProvider } from '@diversifiedfinance/design-system/bottom-sheet';

const { useParam } = createParam<{ slug: string }>();

const endpointsToRefresh = [
	'/api/feed/projects',
	'/api/project',
	ORDERS_ENDPOINT,
	USER_TOKEN_CLAIMS_ENDPOINT,
];

export function TokenClaim() {
	const [projectSlug] = useParam('slug');
	const [successBasket, setSuccessBasket] = useState<TokenClaim[] | null>(
		null
	);
	const { mutate } = useSWRConfig();
	const router = useRouter();

	const onClaimed = useCallback(
		async (tokenClaims: TokenClaim[]) => {
			await mutate(
				(key) =>
					endpointsToRefresh.some((endpointRoute) =>
						key?.toString().startsWith(endpointRoute)
					),
				undefined,
				{ revalidate: true }
			);
			setSuccessBasket(tokenClaims);
		},
		[setSuccessBasket, mutate]
	);

	if (!projectSlug) {
		return null;
	}

	if (successBasket) {
		return (
			<BottomSheetScrollView>
				<TokenClaimCheckoutSuccess
					onAction={() => {
						router.pop();
						setSuccessBasket(null);
					}}
					// basket={successBasket}
				/>
			</BottomSheetScrollView>
		);
	}

	return (
		<>
			<BottomSheetModalProvider>
				<BottomSheetScrollView>
					<TokenClaimCheckout
						projectSlug={projectSlug}
						onClaimed={onClaimed}
					/>
				</BottomSheetScrollView>
			</BottomSheetModalProvider>
		</>
	);
}
