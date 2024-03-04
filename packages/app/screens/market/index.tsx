import { Suspense } from 'react';

import { Spinner } from '@diversifiedfinance/design-system/spinner';
import { View } from '@diversifiedfinance/design-system/view';

import { ErrorBoundary } from '@diversifiedfinance/app/components/error-boundary';
import { withColorScheme } from '@diversifiedfinance/components/memo-with-theme';
import { Market } from '@diversifiedfinance/app/components/market';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';

const MarketScreen = withColorScheme(() => {
	useTrackPageViewed({ name: 'market' });
	return (
		<View tw="w-full flex-1 bg-white dark:bg-black">
			<View tw="md:max-w-screen-content mx-auto w-full flex-1 bg-white dark:bg-black md:px-6">
				<ErrorBoundary>
					<Suspense
						fallback={
							<View tw="mt-10 items-center justify-center">
								<Spinner size="small" />
							</View>
						}
					>
						<Market />
					</Suspense>
				</ErrorBoundary>
			</View>
		</View>
	);
});

export { MarketScreen };
