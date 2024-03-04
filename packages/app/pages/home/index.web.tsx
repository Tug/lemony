import { HomeScreen } from '@diversifiedfinance/app/screens/home';
import { SWRConfig } from 'swr';

export default function HomeRouter({ fallback = {} }: { fallback?: object }) {
	return (
		<SWRConfig value={{ fallback }}>
			<HomeScreen />
		</SWRConfig>
	);
}
