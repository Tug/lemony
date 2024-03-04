import { Link } from '@diversifiedfinance/app/navigation/link';
import Home from '@diversifiedfinance/design-system/icon/Home';
import HomeFilled from '@diversifiedfinance/design-system/icon/HomeFilled';
import Diversified from '@diversifiedfinance/design-system/icon/Diversified';
import Settings from '@diversifiedfinance/design-system/icon/Settings';
import SettingsFilled from '@diversifiedfinance/design-system/icon/SettingsFilled';
import BellFilled from '@diversifiedfinance/design-system/icon/BellFilled';
import Bell from '@diversifiedfinance/design-system/icon/Bell';
import Wallet, {
	WalletFilled,
} from '@diversifiedfinance/design-system/icon/Wallet';
import Transfer from '@diversifiedfinance/design-system/icon/Transfer';
import { PressableHover } from '@diversifiedfinance/design-system/pressable-hover';
import type { TW } from '@diversifiedfinance/design-system/tailwind';
import { View } from '@diversifiedfinance/design-system/view';
import { Suspense } from 'react';
import { Platform } from 'react-native';
import getPath from '../lib/get-path';
import { useNotifications } from '@diversifiedfinance/app/hooks/use-notifications';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { ErrorBoundary } from '@diversifiedfinance/app/components/error-boundary';

type TabBarIconProps = {
	color?: string;
	focused?: boolean;
	tw?: TW;
	onPress?: () => void;
	size?: number;
};

type TabBarButtonProps = {
	tab: string;
	children: React.ReactNode;
	tw?: TW;
	onPress?: () => void;
};

function TabBarIcon({ tab, children, tw, onPress }: TabBarButtonProps) {
	if (Platform.OS === 'web') {
		if (onPress) {
			return (
				<PressableHover
					onPress={onPress}
					tw={[
						'h-12 w-12 items-center justify-center rounded-full md:bg-gray-100 md:dark:bg-gray-900',
						tw ?? '',
					]}
				>
					{children}
				</PressableHover>
			);
		}
		if (!tab) return null;
		return (
			<Link href={tab}>
				<View
					tw={[
						'h-12 w-12 items-center justify-center rounded-full md:bg-gray-100 md:dark:bg-gray-900',
						tw ?? '',
					]}
				>
					{children}
				</View>
			</Link>
		);
	}

	return <View tw="h-12 w-14 items-center justify-center">{children}</View>;
}

export const HomeTabBarIcon = ({
	color,
	focused,
	size = 24,
}: TabBarIconProps) => {
	const homePath = getPath('home');
	return (
		<TabBarIcon tab={homePath}>
			{focused ? (
				<HomeFilled
					style={{ zIndex: 1 }}
					width={size}
					height={size}
					color={color}
				/>
			) : (
				<Home
					style={{ zIndex: 1 }}
					width={size}
					height={size}
					color={color}
				/>
			)}
		</TabBarIcon>
	);
};

export const DiversifiedTabBarIcon = ({
	color,
	focused,
	size = 24,
}: TabBarIconProps) => {
	const homePath = getPath('home');
	return (
		<TabBarIcon tab={homePath}>
			<Diversified
				style={{ zIndex: 1 }}
				width={size}
				height={size}
				color={focused ? undefined : color}
			/>
		</TabBarIcon>
	);
};

export const NotificationsTabBarIcon = ({
	color,
	focused,
	onPress,
}: TabBarIconProps) => {
	const redirectToScreen = useNavigateToScreen();
	return (
		<TabBarIcon
			onPress={() => {
				if (onPress) {
					onPress();
				} else {
					redirectToScreen('notifications');
				}
			}}
		>
			{focused ? (
				<BellFilled
					style={{ zIndex: 1 }}
					width={24}
					height={24}
					color={color}
				/>
			) : (
				<Bell
					style={{ zIndex: 1 }}
					width={24}
					height={24}
					color={color}
				/>
			)}
			<ErrorBoundary renderFallback={() => <></>}>
				<Suspense fallback={null}>
					<UnreadNotificationIndicator />
				</Suspense>
			</ErrorBoundary>
		</TabBarIcon>
	);
};

const UnreadNotificationIndicator = () => {
	const { hasUnreadNotification } = useNotifications();

	return (
		<View
			tw="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500"
			style={{ opacity: hasUnreadNotification ? 1 : 0 }}
		/>
	);
};

export const MarketTabBarIcon = ({
	color,
	size = 24,
	focused,
}: TabBarIconProps) => {
	const portfolioPath = getPath('portfolioTab');
	return (
		<TabBarIcon tab={portfolioPath}>
			<Transfer
				style={{ zIndex: 1 }}
				width={size}
				height={size}
				color={color}
				filled={focused}
				strokeWidth={focused ? 3 : 2}
			/>
		</TabBarIcon>
	);
};

export const PortfolioTabBarIcon = ({
	color,
	size = 24,
	focused,
}: TabBarIconProps) => {
	const portfolioPath = getPath('portfolioTab');
	return (
		<TabBarIcon tab={portfolioPath}>
			{focused ? (
				<WalletFilled
					style={{ zIndex: 1 }}
					width={size}
					height={size}
					color={color}
				/>
			) : (
				<Wallet
					style={{ zIndex: 1 }}
					width={size}
					height={size}
					color={color}
				/>
			)}
		</TabBarIcon>
	);
};

export const SettingsTabBarIcon = ({ color, focused }: TabBarIconProps) => {
	const settingsPath = getPath('settings');
	return (
		<TabBarIcon tab={settingsPath}>
			{focused ? (
				<SettingsFilled
					style={{ zIndex: 1 }}
					width={24}
					height={24}
					color={color}
				/>
			) : (
				<Settings
					style={{ zIndex: 1 }}
					width={24}
					height={24}
					color={color}
				/>
			)}
		</TabBarIcon>
	);
};
