import { allRoutes } from '../screens.config';
import {
	BottomTabNavigatorParams,
	HomeStackParams,
	OnboardingNavigatorParams,
	PortfolioStackParams,
	RootStackNavigatorParams,
	SettingsStackParams,
} from '../navigators/types';

export type AllRoutesParams = RootStackNavigatorParams &
	SettingsStackParams &
	BottomTabNavigatorParams &
	HomeStackParams &
	PortfolioStackParams &
	OnboardingNavigatorParams;

export default function getPath<S extends keyof AllRoutesParams>(
	screenName: keyof AllRoutesParams,
	params?: AllRoutesParams[S],
	searchParams?: Record<string, string>
) {
	const route = allRoutes[screenName]?.replace(
		/(^|\/):(\w+)(?=\/|$)/g,
		(match: string, g1: string, g2: string) =>
			g1 + (typeof params?.[g2] === 'string' ? params[g2] : match)
	);
	const search = searchParams
		? `?${new URLSearchParams(searchParams).toString()}`
		: '';
	return `/${route}${search}`;
}
