import { useEffect, useRef, useState, Suspense, useMemo } from 'react';
import { Platform } from 'react-native';
import * as Popover from '@radix-ui/react-popover';
import { useTranslation } from 'react-i18next';
import { Button } from '@diversifiedfinance/design-system/button';
import { useColorScheme } from '@diversifiedfinance/design-system/color-scheme';
import { Divider } from '@diversifiedfinance/design-system/divider';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import {
	Bell,
	BellFilled,
	Home,
	PhonePortraitOutline,
	Settings,
	Menu,
	Moon,
	Sun,
	DarkMode,
	LogOut,
	ChevronRight,
	DiversifiedWordmark,
	Wallet,
} from '@diversifiedfinance/design-system/icon';
import { Image } from '@diversifiedfinance/design-system/image';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { Spinner } from '@diversifiedfinance/design-system/spinner';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';

import { MenuItemIcon } from '@diversifiedfinance/app/components/dropdown/menu-item-icon';
import { ErrorBoundary } from '@diversifiedfinance/app/components/error-boundary';
import { Notifications } from '@diversifiedfinance/app/components/notifications';
import { useAuth } from '@diversifiedfinance/app/hooks/auth/use-auth';
import { useFooter } from '@diversifiedfinance/app/hooks/use-footer';
import { useNotifications } from '@diversifiedfinance/app/hooks/use-notifications';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { Link, TextLink } from '@diversifiedfinance/app/navigation/link';
import {
	useNavigateToLogin,
	useNavigateToOnboarding,
} from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { withColorScheme } from '@diversifiedfinance/components/memo-with-theme';

import {
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemTitle,
	DropdownMenuRoot,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
} from '@diversifiedfinance/design-system/dropdown-menu';
import { Analytics } from '@diversifiedfinance/app/lib/analytics';

const NotificationsInHeader = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { hasUnreadNotification } = useNotifications();

	const router = useRouter();
	const isDark = useIsDarkMode();
	const prevPath = useRef(router.pathname);
	const prevQuery = useRef(router.query);

	useEffect(() => {
		if (
			Platform.OS === 'web' &&
			isOpen &&
			(prevPath.current !== router.pathname ||
				prevQuery.current !== router.query)
		) {
			setIsOpen(false);
		}
		prevPath.current = router.pathname;
		prevQuery.current = router.query;
	}, [router.pathname, isOpen, router.query]);
	const Icon = isOpen ? BellFilled : Bell;
	return (
		<Popover.Root modal={true} open={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger>
				<View
					tw={[
						'mt-2 h-[50px] flex-row items-center rounded-2xl pl-4 transition-all hover:bg-gray-50 hover:dark:bg-gray-900',
					].join(' ')}
				>
					<View>
						<Icon
							color={isDark ? '#fff' : '#000'}
							width={24}
							height={24}
						/>
						<View
							tw="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-amber-500 "
							style={{ opacity: hasUnreadNotification ? 1 : 0 }}
						/>
					</View>
					<Text tw={['ml-4 text-lg text-black dark:text-white']}>
						Notifications
					</Text>
				</View>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content sideOffset={36} side="right" align="center">
					<View
						tw="h-screen w-[332px] overflow-hidden border-l border-gray-200 bg-white dark:border-r dark:border-gray-800 dark:bg-black"
						style={{
							// @ts-ignore
							boxShadow: 'rgb(0 0 0 / 10%) 5px 15px 15px',
						}}
					>
						<ErrorBoundary>
							<Suspense
								fallback={
									<View tw="p-4">
										<Spinner />
									</View>
								}
							>
								<Notifications useWindowScroll={false} />
							</Suspense>
						</ErrorBoundary>
					</View>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
};

const MenuItem = ({
	focused,
	href,
	icon,
	title,
}: {
	focused?: boolean;
	href: string;
	icon: any;
	title: string;
}) => {
	return (
		<Link
			tw={[
				'mt-2 h-[50px] flex-row items-center rounded-2xl pl-4 transition-all hover:bg-gray-50 hover:dark:bg-gray-900',
				focused && 'bg-coolGray-50 dark:bg-gray-800',
			].join(' ')}
			href={href}
		>
			{icon()}
			<Text
				tw={[
					'ml-4 text-lg text-black dark:text-white',
					focused ? 'font-bold' : 'font-normal',
				]}
			>
				{title}
			</Text>
		</Link>
	);
};
export const HeaderMd = withColorScheme(() => {
	const { user, isAuthenticated } = useUser();
	const navigateToLogin = useNavigateToLogin();
	const navigateToOnboarding = useNavigateToOnboarding();
	const { links, social } = useFooter();
	const isDark = useIsDarkMode();
	const router = useRouter();
	const iconColor = isDark ? '#fff' : '#000';
	const { t } = useTranslation();
	const { setColorScheme } = useColorScheme();
	const { logout } = useAuth();
	const HOME_ROUTES = useMemo(
		() =>
			[
				{
					title: t('Opportunities'),
					key: 'Home',
					icon: Home,
					pathname: '/',
					focused: router.pathname === '/',
					visible: true,
				},
				{
					title: t('Notifications'),
					key: 'Notifications',
					icon: Bell,
					pathname: '/notifications',
					visible: isAuthenticated,
				},
				{
					title: t('Portfolio'),
					key: 'Portfolio',
					icon: Wallet,
					pathname: `/portfolio`,
					focused: router.asPath === `/portfolio`,
					visible: isAuthenticated,
				},
			].filter((item) => !!item?.visible),
		[isAuthenticated, router.asPath, router.pathname]
	);

	return (
		<View tw="fixed top-0 h-full bg-white pl-2 dark:bg-black">
			<View tw="h-full min-h-screen w-60 overflow-y-auto pl-4">
				<Link href="/" tw="flex-row items-center pt-8">
					<DiversifiedWordmark
						color={iconColor}
						width={28 * (84 / 16)}
						height={28}
					/>
				</Link>
				<View tw="-ml-4 mt-5 w-48 justify-center">
					{HOME_ROUTES.map((item) => {
						if (item.key === 'Notifications') {
							return <NotificationsInHeader key={item.key} />;
						}
						return (
							<MenuItem
								focused={item.focused}
								href={item.pathname}
								icon={() =>
									item.icon({
										color: iconColor,
										width: 24,
										height: 24,
									})
								}
								title={item.title}
								key={item.pathname}
							/>
						);
					})}
					<DropdownMenuRoot>
						<DropdownMenuTrigger>
							<View
								tw={[
									'mt-2 h-[50px] cursor-pointer flex-row items-center rounded-2xl pl-4 transition-all hover:bg-gray-50 hover:dark:bg-gray-900',
								]}
							>
								<Menu
									width={24}
									height={24}
									color={iconColor}
								/>
								<Text
									tw={[
										'ml-4 text-lg text-black dark:text-white',
									]}
								>
									{t('More')}
								</Text>
							</View>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							align="center"
							tw="w-48"
							disableBlurEffect
							side="bottom"
							sideOffset={0}
						>
							{isAuthenticated && (
								<DropdownMenuItem
									onSelect={() => router.push('/settings')}
									key="your-settings"
								>
									<MenuItemIcon Icon={Settings} />

									<DropdownMenuItemTitle tw="text-gray-700 dark:text-neutral-100">
										{t('Settings')}
									</DropdownMenuItemTitle>
								</DropdownMenuItem>
							)}

							<DropdownMenuSub>
								<DropdownMenuSubTrigger key="nested-group-trigger">
									<MenuItemIcon
										Icon={isDark ? Moon : Sun}
										ios={{
											name: isDark ? 'moon' : 'sun.max',
										}}
									/>

									<DropdownMenuItemTitle tw="w-full text-gray-700 dark:text-neutral-100">
										{t('Theme')}
									</DropdownMenuItemTitle>

									<View tw="absolute right-0">
										<ChevronRight
											width={20}
											height={20}
											color={
												isDark
													? '#fff'
													: colors.gray[900]
											}
										/>
									</View>
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent
									disableBlurEffect
									alignOffset={-8}
									sideOffset={4}
								>
									<DropdownMenuItem
										onSelect={() => setColorScheme('light')}
										key="nested-group-1"
									>
										<MenuItemIcon
											Icon={Sun}
											ios={{ name: 'sun.max' }}
										/>
										<DropdownMenuItemTitle tw="text-gray-700 dark:text-neutral-100">
											{t('Light')}
										</DropdownMenuItemTitle>
									</DropdownMenuItem>
									<DropdownMenuItem
										onSelect={() => setColorScheme('dark')}
										key="nested-group-2"
									>
										<MenuItemIcon
											Icon={Moon}
											ios={{ name: 'moon' }}
										/>
										<DropdownMenuItemTitle tw="text-gray-700 dark:text-neutral-100">
											{t('Dark')}
										</DropdownMenuItemTitle>
									</DropdownMenuItem>
									<DropdownMenuItem
										onSelect={() => setColorScheme(null)}
										key="nested-group-3"
									>
										<MenuItemIcon
											Icon={DarkMode}
											ios={{
												name: 'circle.righthalf.filled',
											}}
										/>
										<DropdownMenuItemTitle tw="text-gray-700 dark:text-neutral-100">
											{t('System')}
										</DropdownMenuItemTitle>
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							{isAuthenticated && (
								<DropdownMenuItem
									destructive
									onSelect={logout}
									key="sign-out"
								>
									<MenuItemIcon
										Icon={LogOut}
										ios={{
											name: 'rectangle.portrait.and.arrow.right',
										}}
									/>
									<DropdownMenuItemTitle tw="text-gray-700 dark:text-neutral-100">
										{t('Sign Out')}
									</DropdownMenuItemTitle>
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenuRoot>
				</View>
				<View tw="w-40">
					{!isAuthenticated && (
						<View tw="mt-6">
							<Button
								variant="text"
								size="regular"
								onPress={navigateToLogin}
							>
								<Text tw="text-base font-bold text-white dark:text-black">
									{t('Sign in')}
								</Text>
							</Button>
							<Button
								size="regular"
								onPress={() =>
									navigateToOnboarding('onboardingSignUp')
								}
							>
								<Text tw="text-base font-bold text-white dark:text-black">
									{t('Sign up')}
								</Text>
							</Button>
						</View>
					)}
					<Divider tw="my-6" />
					<View tw="rounded-2xl border  border-gray-200 pb-2 pt-4 dark:border-gray-600">
						<View tw="flex-row items-center justify-center">
							<PhonePortraitOutline
								color={iconColor}
								width={18}
								height={18}
							/>
							<Text tw="text-15 ml-1 font-bold dark:text-white">
								{t('Get the App')}
							</Text>
						</View>
						<View tw="flex items-center justify-between px-2 pt-4">
							<Link
								href="https://apps.apple.com/app/apple-store/id6446693590"
								target="_blank"
								tw="duration-150 hover:scale-105"
								onPress={() =>
									Analytics.track(
										Analytics.events.BUTTON_CLICKED,
										{
											target: 'apple-store-button',
											type: 'AppStoreDownload',
											name: 'Download App',
											platform: 'iOS',
										}
									)
								}
							>
								<Image
									source={{
										uri: '/images/AppStoreDownload.png',
									}}
									width={120}
									height={40}
									alt="App Store"
								/>
							</Link>
							<Link
								href="https://play.google.com/store/apps/details?id=fi.diversified.app"
								target="_blank"
								tw="mt-2 duration-150 hover:scale-105"
								onPress={() =>
									Analytics.track(
										Analytics.events.BUTTON_CLICKED,
										{
											target: 'play-store-button',
											type: 'AppStoreDownload',
											name: 'Download App',
											platform: 'Android',
										}
									)
								}
							>
								<Image
									source={{
										uri: '/images/GooglePlayDownload.png',
									}}
									width={120}
									height={40}
									alt="Google Play"
								/>
							</Link>
						</View>
					</View>
				</View>
				<View tw={['relative bottom-0 mt-6 inline-block']} style={{}}>
					<View tw="inline-block">
						{links.map((item) => (
							<TextLink
								href={item.link}
								target="_blank"
								tw="text-xs text-gray-500 dark:text-gray-300"
								key={item.title}
							>
								{item.title}
								{` · `}
							</TextLink>
						))}
					</View>
					<Text tw="text-xs text-gray-500 dark:text-gray-300">
						©&nbsp;2023&nbsp;Diversified&nbsp;SAS
					</Text>
					<View tw="mt-2 inline-block w-full">
						{social.map((item) => (
							<Link
								href={item.link}
								hrefAttrs={{
									target: '_blank',
									rel: 'noreferrer',
								}}
								key={item.title}
								tw="inline-block w-1/4"
							>
								{item?.icon({
									color: colors.gray[400],
									width: 20,
									height: 20,
								})}
							</Link>
						))}
					</View>
				</View>
			</View>
		</View>
	);
});
