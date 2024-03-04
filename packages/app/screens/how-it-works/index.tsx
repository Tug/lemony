import OnboardingHowItWorks from '@diversifiedfinance/app/components/how-it-works';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import { withColorScheme } from '@diversifiedfinance/components/memo-with-theme';
import React, { Suspense } from 'react';
import { View } from '@diversifiedfinance/design-system';
import { ErrorBoundary } from '../../components/error-boundary';

const HowItWorksScreen = withColorScheme(() => {
	useTrackPageViewed({ name: 'howItWorks' });

	return (
		<ErrorBoundary>
			<Suspense fallback={<View />}>
				<OnboardingHowItWorks />
			</Suspense>
		</ErrorBoundary>
	);
});

export { HowItWorksScreen };
