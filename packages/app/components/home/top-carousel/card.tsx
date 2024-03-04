import { Pressable, Text, View } from '@diversifiedfinance/design-system';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { Linking } from 'react-native';
import React from 'react';
import { CasinoChip } from './icons/casino-chip';
import { CommentV2 } from './icons/comment-v2';
import { Handshake } from './icons/handshake';
import { Newsletter } from './icons/newsletter';
import { PCheck } from './icons/p-check';
import { PeriodX2 } from './icons/period-x2';
import { PeriodX3 } from './icons/period-x3';
import { UserEdit } from './icons/user-edit';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Analytics } from '@diversifiedfinance/app/lib/analytics';
import AlertTriangle from '@diversifiedfinance/design-system/icon/AlertTriangle';

const iconComponents = {
	'casino-chip': CasinoChip,
	'comment-v2': CommentV2,
	handshake: Handshake,
	newsletter: Newsletter,
	'p-check': PCheck,
	'period-x2': PeriodX2,
	'period-x3': PeriodX3,
	'user-edit': UserEdit,
	alert: function AlertIcon() {
		const isDark = useIsDarkMode();
		return (
			<AlertTriangle
				color={isDark ? colors.black : colors.white}
				width={36}
				height={36}
			/>
		);
	},
};

export interface TopCarouselCardProps {
	tw?: string;
	textTw?: string;
	title?: string;
	description?: string;
	icon?: keyof typeof iconComponents;
	path?: string;
	url?: string;
}

export function TopCarouselCard({
	tw,
	textTw,
	title,
	description,
	icon,
	path,
	url,
}: TopCarouselCardProps) {
	const router = useRouter();
	const isDark = useIsDarkMode();
	const IconComponent = iconComponents[icon];

	return (
		<View
			tw={[
				'h-full w-full px-5 py-4 justify-center rounded-2xl overflow-hidden bg-white dark:bg-gray-900',
				tw ?? '',
			]}
		>
			<TouchableOpacity
				onPress={async () => {
					Analytics.track(Analytics.events.BUTTON_CLICKED, {
						target: 'card',
						type: 'topCarouselCard',
						name: 'View Card',
						title,
						description,
						path,
						url,
					});
					if (path) {
						router.push(path);
						return;
					}
					if (url && (await Linking.canOpenURL(url))) {
						return Linking.openURL(url);
					}
					Analytics.track(Analytics.events.BUTTON_CLICKED_FAILURE, {
						target: 'card',
						type: 'topCarouselCard',
						name: 'View Card',
						title,
						description,
						path,
						url,
					});
				}}
			>
				<View tw="flex-row items-center gap-x-2">
					{IconComponent && (
						<View>
							<IconComponent
								color={
									isDark
										? colors.themeYellow
										: colors.diversifiedBlue
								}
							/>
						</View>
					)}
					<View tw="flex-col grow shrink">
						{title && (
							<View tw="my-1">
								<Text
									tw={[
										'text-sm font-bold text-black dark:text-white',
										textTw ?? '',
									]}
								>
									{title}
								</Text>
							</View>
						)}
						{description && (
							<View tw="my-1">
								<Text
									tw={[
										'text-sm text-black dark:text-white',
										textTw ?? '',
									]}
								>
									{description}
								</Text>
							</View>
						)}
					</View>
				</View>
			</TouchableOpacity>
		</View>
	);
}
