import { AppProviders } from './app-providers';

export function Provider({ children }: { children: React.ReactNode }) {
	return <AppProviders>{children}</AppProviders>;
}
