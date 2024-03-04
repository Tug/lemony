import { VIPProgramScreen } from '@diversifiedfinance/app/screens/vip-program';
import { SWRConfig } from 'swr';

const VIPProgramRouter = ({ fallback = {} }: { fallback?: object }) => {
	return (
		<SWRConfig value={{ fallback }}>
			<VIPProgramScreen />
		</SWRConfig>
	);
};

export default VIPProgramRouter;
