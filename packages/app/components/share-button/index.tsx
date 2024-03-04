import { Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Analytics } from '@diversifiedfinance/app/lib/analytics';
import { toast } from '@diversifiedfinance/design-system/toast';
import { PressableScale } from '@diversifiedfinance/design-system';
import { useTranslation } from 'react-i18next';
import SvgShare from '@diversifiedfinance/design-system/icon/Share';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

export interface ShareButtonProps {
	message: string;
	url: string;
	withBackground?: boolean;
	iconColor?: string;
}

export function ShareButton({ message, url }: ShareButtonProps) {
	const { t } = useTranslation();
	const isDark = useIsDarkMode();

	const shareScreen = async () => {
		if (Platform.OS === 'web') {
			await Clipboard.setStringAsync(message);
			Analytics.track(Analytics.events.USER_SHARED_URL, {
				activityType: 'clipboard',
				url,
			});
			toast.success(t('Url copied to clipboard!'));
			return;
		}
		try {
			const result = await Share.share({
				message,
			});
			if (result.action === Share.sharedAction) {
				Analytics.track(Analytics.events.USER_SHARED_URL, {
					activityType: result.activityType,
					url,
				});
			} else if (result.action === Share.dismissedAction) {
				Analytics.track(Analytics.events.USER_DISMISSED, {
					name: 'Share Url',
					url,
				});
			}
		} catch (error) {
			if (__DEV__) {
				console.error(error);
			}
		}
	};

	return (
		<PressableScale
			hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
			style={[
				{
					height: 32,
					width: 32,
					justifyContent: 'center',
					alignItems: 'center',
					borderRadius: 999,
				},
			]}
			onPress={shareScreen}
		>
			<SvgShare
				color={isDark ? 'white' : 'black'}
				width={20}
				height={20}
			/>
		</PressableScale>
	);
}
