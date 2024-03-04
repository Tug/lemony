import { ErrorBoundary } from '@diversifiedfinance/app/components/error-boundary';
import { Portfolio } from '@diversifiedfinance/app/components/portfolio';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import { withColorScheme } from '@diversifiedfinance/components/memo-with-theme';

const PortfolioScreen = withColorScheme(() => {
	useTrackPageViewed({ name: 'portfolio' });

	return (
		<ErrorBoundary>
			<Portfolio />
		</ErrorBoundary>
	);
});

export { PortfolioScreen };
