import { PortfolioScreen } from '@diversifiedfinance/app/screens/portfolio';
import { SWRConfig } from 'swr';

function PortfolioRouter({ fallback = {} }: { fallback?: object }) {
	return (
		<SWRConfig value={{ fallback }}>
			<PortfolioScreen />
		</SWRConfig>
	);
}

export default PortfolioRouter;
