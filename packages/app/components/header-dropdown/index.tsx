import { useAuth } from '@diversifiedfinance/app/hooks/auth/use-auth';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { MenuItemIcon } from '@diversifiedfinance/components/dropdown/menu-item-icon';
import { Avatar } from '@diversifiedfinance/design-system/avatar';
import { useColorScheme } from '@diversifiedfinance/design-system/color-scheme';
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
import Settings from '@diversifiedfinance/design-system/icon/Settings';
import Moon from '@diversifiedfinance/design-system/icon/Moon';
import Sun from '@diversifiedfinance/design-system/icon/Sun';
import LogOut from '@diversifiedfinance/design-system/icon/LogOut';
import DarkMode from '@diversifiedfinance/design-system/icon/DarkMode';
import Wallet from '@diversifiedfinance/design-system/icon/Wallet';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { Text } from '@diversifiedfinance/design-system/text';
import { breakpoints } from '@diversifiedfinance/design-system/theme';
import { View } from '@diversifiedfinance/design-system/view';
import { Platform, useWindowDimensions } from 'react-native';
import Menu from '@diversifiedfinance/design-system/icon/Menu';
import Home from '@diversifiedfinance/design-system/icon/Home';
import { useTranslation } from 'react-i18next';

type HeaderDropdownProps = {
	type: 'profile' | 'settings';
	withBackground?: boolean;
};

function HeaderDropdown({ type, withBackground = false }: HeaderDropdownProps) {
	const { t } = useTranslation();
	const { logout } = useAuth();
	const router = useRouter();
	const { colorScheme, setColorScheme } = useColorScheme();
	const { user } = useUser();
	const { width } = useWindowDimensions();
	const isWeb = Platform.OS === 'web';
	const isMdWidth = width >= breakpoints.md;
	const isDark = colorScheme === 'dark';

	return (
		<DropdownMenuRoot>
			<DropdownMenuTrigger>
				{type === 'profile' ? (
					<View tw="flex h-12 cursor-pointer flex-row items-center justify-center rounded-full bg-gray-100 px-2 dark:bg-gray-900">
						<Avatar
							alt="Avatar"
							url={user?.data?.profile?.img_url}
						/>
						{isWeb && isMdWidth && user?.data?.profile?.username ? (
							<Text tw="ml-2 mr-1 font-semibold dark:text-white ">
								{`${user?.data?.profile.username}`}
							</Text>
						) : null}
					</View>
				) : (
					<View
						tw={[
							'h-8 w-8 items-center justify-center rounded-full',
							withBackground ? 'bg-black/60' : '',
						]}
					>
						<Menu
							width={24}
							height={24}
							color={
								withBackground
									? '#FFF'
									: isDark
									? '#FFF'
									: '#000'
							}
						/>
					</View>
				)}
			</DropdownMenuTrigger>

			<DropdownMenuContent loop>
				{Platform.OS === 'web' && (
					<>
						<DropdownMenuItem
							onSelect={() => router.push('/portfolio')}
							key="my-portfolio"
						>
							<MenuItemIcon Icon={Wallet} />
							<DropdownMenuItemTitle tw="font-semibold text-gray-700 dark:text-neutral-300">
								{t('My Portfolio')}
							</DropdownMenuItemTitle>
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() => router.push('/settings')}
							key="my-settings"
						>
							<MenuItemIcon
								Icon={Settings}
								ios={{
									name: 'gear',
								}}
							/>
							<DropdownMenuItemTitle tw="font-semibold text-gray-700 dark:text-neutral-300">
								{t('Settings')}
							</DropdownMenuItemTitle>
						</DropdownMenuItem>
					</>
				)}

				{Platform.OS === 'web' && (
					<DropdownMenuSub>
						<DropdownMenuSubTrigger key="nested-group-trigger">
							<MenuItemIcon
								Icon={isDark ? Moon : Sun}
								ios={{
									name: isDark ? 'moon' : 'sun.max',
								}}
							/>
							<DropdownMenuItemTitle tw="font-semibold text-gray-700 dark:text-neutral-300">
								{t('Theme')}
							</DropdownMenuItemTitle>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuItem
								onSelect={() => setColorScheme('light')}
								key="nested-group-1"
							>
								<MenuItemIcon
									Icon={Sun}
									ios={{ name: 'sun.max' }}
								/>
								<DropdownMenuItemTitle tw="font-semibold text-gray-700 dark:text-neutral-300">
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
								<DropdownMenuItemTitle tw="font-semibold text-gray-700 dark:text-neutral-300">
									{t('Dark')}
								</DropdownMenuItemTitle>
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => setColorScheme(null)}
								key="nested-group-3"
							>
								<MenuItemIcon
									Icon={DarkMode}
									ios={{ name: 'circle.righthalf.filled' }}
								/>
								<DropdownMenuItemTitle tw="font-semibold text-gray-700 dark:text-neutral-300">
									{t('System')}
								</DropdownMenuItemTitle>
							</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				)}

				{Platform.OS === 'web' && (
					<DropdownMenuItem
						destructive
						onSelect={logout}
						key="sign-out"
					>
						<MenuItemIcon
							Icon={LogOut}
							ios={{ name: 'rectangle.portrait.and.arrow.right' }}
						/>
						<DropdownMenuItemTitle tw="font-semibold text-gray-700 dark:text-neutral-300">
							{t('Sign Out')}
						</DropdownMenuItemTitle>
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenuRoot>
	);
}

export { HeaderDropdown };
