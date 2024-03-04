import { SettingsScreen } from '@diversifiedfinance/app/screens/settings';
import { SWRConfig } from 'swr';

function SettingsNavigator({ fallback = {} }: { fallback?: object }) {
	return (
		<SWRConfig value={{ fallback }}>
			<SettingsScreen />
		</SWRConfig>
	);
}

export default SettingsNavigator;
