import { ErrorBoundary } from '@diversifiedfinance/app/components/error-boundary';
import ProjectScrollList from '@diversifiedfinance/app/components/project-scroll-list';
import ProjectSwipeList from '@diversifiedfinance/app/components/project-swipe-list';
import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';
import { View, Image, Text } from '@diversifiedfinance/design-system';
import { useFeature } from '@growthbook/growthbook-react';
import React, { Suspense } from 'react';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { Home as HomeComponent } from '@diversifiedfinance/app/components/home';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { Link } from '@diversifiedfinance/app/navigation/link';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';

function DownloadTheApp() {
	const isDark = useIsDarkMode();
	return (
		<View tw="mx-12 my-4 items-center">
			<Text tw="text-center text-3xl font-bold text-gray-900 dark:text-white">
				Diversify your portfolio with rare and profitable luxury
				products.
			</Text>
			<View tw="mt-8 flex-row items-center">
				<Link
					href="https://apps.apple.com/app/apple-store/id6446693590"
					target="_blank"
				>
					<Image
						source={{
							uri: isDark
								? '/images/AppStoreDark.png'
								: '/images/AppStoreLight.png',
						}}
						width={144}
						height={42}
						tw="rounded-md duration-150 hover:scale-105"
						alt="App Store"
					/>
				</Link>
				<View tw="w-8" />
				<Link
					href="https://play.google.com/store/apps/details?id=fi.diversified.app"
					target="_blank"
				>
					<Image
						source={{
							uri: isDark
								? '/images/GooglePlayDark.png'
								: '/images/GooglePlayLight.png',
						}}
						width={144}
						height={42}
						tw="rounded-md duration-150 hover:scale-105"
						alt="Google Play"
					/>
				</Link>
			</View>
		</View>
	);
}

function Home() {
	useUser({ redirectIfProfileIncomplete: true, requireAuth: true });
	useTrackPageViewed({ name: 'home' });

	return <HomeComponent />;
}

function HomeScreen() {
	return (
		<ErrorBoundary>
			<Suspense fallback={<View />}>
				<Home />
			</Suspense>
		</ErrorBoundary>
	);
}

export { HomeScreen };
