import { useWindowDimensions } from 'react-native';
import { Spinner } from '@diversifiedfinance/design-system/spinner';
import { View } from '@diversifiedfinance/design-system/view';
import { ErrorBoundary } from '@diversifiedfinance/app/components/error-boundary';
import { usePlatformBottomHeight } from '@diversifiedfinance/app/hooks/use-platform-bottom-height';
import { breakpoints } from '@diversifiedfinance/design-system/theme';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { SettingsHeader } from './setting-header';
import { SettingsMd } from './index.md';
import { SettingTabsScene } from './tabs';
import { useSettingsRoutes } from '@diversifiedfinance/app/components/settings/routes';
import { useRouter } from '@diversifiedfinance/design-system/router';
import filter from '@diversifiedfinance/design-system/icon/Filter';

const SettingsTabs = () => {
	const bottomHeight = usePlatformBottomHeight();
	const { width } = useWindowDimensions();
	const { isAuthenticated } = useUser({
		redirectTo: '/login',
		redirectIfProfileIncomplete: false,
	});
	const isLgWidth = width >= breakpoints.lg;
	const { allRoutes } = useSettingsRoutes();
	const router = useRouter();
	// router.pathname will have the dynamic route value on web (eg. `/settings/[[...slug]]`)
	// router.asPath will have the actual route value (eg. `/settings/profile`)
	const pathname = router.asPath;
	const routeIndex =
		allRoutes
			.map((r, index) => ({
				...r,
				index,
				pathname:
					r.href?.pathname ??
					(typeof r.href === 'string'
						? new URL(r.href, 'http://e.c').pathname
						: undefined),
			}))
			.filter((r) => Boolean(r.pathname))
			.sort((a, b) => b.pathname.localeCompare(a.pathname))
			.find((r) => pathname.startsWith(r.pathname))?.index ?? 0;

	if (!isAuthenticated) {
		return (
			<View tw="flex-1 items-center justify-center">
				<Spinner />
			</View>
		);
	}

	return isLgWidth ? (
		<SettingsMd currentRouteIndex={routeIndex} routes={allRoutes} />
	) : (
		<View tw="h-screen w-full border-l-0 border-gray-200 bg-white dark:border-gray-800 dark:bg-black md:border-l">
			<SettingsHeader
				index={routeIndex}
				setIndex={() => {}}
				routers={[]}
			/>
			<SettingTabsScene route={allRoutes[routeIndex]} />
			<View style={{ height: bottomHeight }} />
			<View />
		</View>
	);
};

export function Settings() {
	return (
		<ErrorBoundary>
			<SettingsTabs />
		</ErrorBoundary>
	);
}

export default Settings;
