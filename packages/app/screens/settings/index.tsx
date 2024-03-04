import { Settings } from '@diversifiedfinance/app/components/settings';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import { withColorScheme } from '@diversifiedfinance/components/memo-with-theme';
import { ErrorBoundary } from '../../components/error-boundary';
import React, { Suspense } from 'react';
import { View } from '@diversifiedfinance/design-system';

const SettingsScreen = withColorScheme(() => {
	useTrackPageViewed({ name: 'settings' });

	return (
		<ErrorBoundary>
			<Suspense fallback={<View />}>
				<Settings />
			</Suspense>
		</ErrorBoundary>
	);
});

export { SettingsScreen };
