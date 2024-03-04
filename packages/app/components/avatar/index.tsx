import {
	ContentLayoutOffset,
	useContentWidth,
} from '../../hooks/use-content-width';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { getProfileImage } from '@diversifiedfinance/app/utilities';
import { Image, Skeleton } from '@diversifiedfinance/design-system';
import { Avatar as DSAvatar } from '@diversifiedfinance/design-system/avatar';
import { useColorScheme } from '@diversifiedfinance/design-system/color-scheme';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { LightBox } from '@diversifiedfinance/design-system/light-box';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { Platform, StyleSheet, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFeature } from '@growthbook/growthbook-react';
import UserCircle from '@diversifiedfinance/design-system/icon/UserCircle';

interface AvatarProps {
	size?: number;
	border?: number;
	iconColor?: string;
}

export default function Avatar({ size = 24, iconColor }: AvatarProps) {
	const avatarSupportDisabled = useFeature('avatar-support').off;
	const { user } = useUser();
	const profileData = user?.data?.profile;

	if (avatarSupportDisabled || !profileData) {
		return <UserCircle color={iconColor} />;
	}

	const imgSource = getProfileImage(profileData);
	return (
		<DSAvatar
			url={imgSource}
			size={size}
			alt={profileData?.name ?? 'User avatar'}
		/>
	);
}

export function PressableAvatar({ size = 64, border = 4 }: AvatarProps) {
	const { user, isLoading } = useUser();
	const isDark = useIsDarkMode();
	const profileData = user?.data?.profile;
	const imgSource = getProfileImage(profileData);
	const { width, height: screenHeight } = useWindowDimensions();
	const { colorScheme } = useColorScheme();
	const coverWidth = useContentWidth(ContentLayoutOffset.PROFILE_COVER);

	return (
		<Animated.View
			style={{
				width: size + border * 2,
				height: size + border * 2,
				borderRadius: 9999,
				overflow: 'hidden',
				borderWidth: border,
				borderColor: isDark ? '#000' : '#FFF',
				backgroundColor: isDark ? colors.gray[900] : colors.gray[200],
				margin: -border,
			}}
		>
			<Skeleton
				height={size}
				width={size}
				show={isLoading || !imgSource}
				radius={0}
			>
				<LightBox
					width={size}
					height={size}
					imgLayout={{
						width: coverWidth,
						height: width,
					}}
					borderRadius={999}
					tapToClose
				>
					<Image
						source={{ uri: imgSource }}
						width={Platform.select({
							web: screenHeight * 0.82,
							default: undefined,
						})}
						height={Platform.select({
							web: screenHeight * 0.82,
							default: undefined,
						})}
						style={Platform.select({
							web: {},
							default: {
								...StyleSheet.absoluteFillObject,
							},
						})}
						alt={profileData?.name}
					/>
				</LightBox>
			</Skeleton>
		</Animated.View>
	);
}
