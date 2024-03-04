import { Portal } from '@gorhom/portal';
import { Spinner } from '@diversifiedfinance/design-system/spinner';
import { View } from '@diversifiedfinance/design-system/view';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { useAuthService } from '@diversifiedfinance/app/lib/auth-service';
import { useMagic } from '@diversifiedfinance/app/lib/magic';
import { useFeature } from '@growthbook/growthbook-react';
import { useIsOnline } from '@diversifiedfinance/app/hooks/use-is-online';

interface LoginOverlaysProps {
	loading?: boolean;
}

function LoginOverlaysComponent({ loading }: LoginOverlaysProps) {
	const { Relayer: AuthServiceRelayer } = useAuthService();
	const { Relayer: MagicRelayer } = useMagic();
	const isOTP = useFeature('twilio-otp-login').on;
	const Relayer = isOTP ? AuthServiceRelayer : MagicRelayer;
	const { isOnline } = useIsOnline();

	return (
		<Portal>
			{loading && (
				<View
					tw="items-center justify-center bg-white opacity-[0.95] dark:bg-black dark:opacity-[0.85]"
					style={StyleSheet.absoluteFill}
				>
					<Spinner />
				</View>
			)}

			{isOnline && <Relayer />}
		</Portal>
	);
}

export const LoginOverlays = memo(LoginOverlaysComponent);
