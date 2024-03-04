import { PhoneNumberPicker } from '@diversifiedfinance/app/components/phone-number-picker';
import {
	useManageAccount,
	useManageAccountMagic,
} from '@diversifiedfinance/app/hooks/use-manage-account';
import { useMagic } from '@diversifiedfinance/app/lib/magic';
import { Analytics, EVENTS } from '@diversifiedfinance/app/lib/analytics';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { View } from '@diversifiedfinance/design-system/view';
import { useCallback } from 'react';
import { createParam } from '@diversifiedfinance/app/navigation/lib/use-param';
import { useFeature } from '@growthbook/growthbook-react';
import { useAuthService } from '@diversifiedfinance/app/lib/auth-service';
import { toast } from '@diversifiedfinance/design-system/toast';

const { useParam } = createParam<{ phoneNumber: string }>();

const VerifyPhoneNumberModal = () => {
	const router = useRouter();
	const [phone] = useParam('phone');
	const { magic, Relayer: MagicRelayer } = useMagic();
	const isOTP = useFeature('twilio-otp-login').on;
	const { auth, Relayer: OTPRelayer } = useAuthService();
	const { verifyPhoneNumber: verifyPhoneNumberOTP } = useManageAccount();
	const { verifyPhoneNumber: verifyPhoneNumberMagic } =
		useManageAccountMagic();
	const verifyPhoneNumber = isOTP
		? verifyPhoneNumberOTP
		: verifyPhoneNumberMagic;
	const loginWithSMS = isOTP
		? auth.loginWithSMS.bind(auth)
		: magic.auth.loginWithSMS.bind(magic.auth);
	const Relayer = isOTP ? OTPRelayer : MagicRelayer;

	const verify = useCallback(
		async (phoneNumber: string, errorMessage?: string) => {
			try {
				let code;

				if (!errorMessage) {
					code = await loginWithSMS({ phoneNumber });
				} else {
					code = await auth.tryAgain(errorMessage);
				}

				if (!code) {
					throw new Error('Empty code');
				}

				await verifyPhoneNumber(phoneNumber, code);
			} catch (error) {
				if (error?.message === 'OTP Cancelled') {
					return;
				}
				if (error?.response?.data?.name === 'LoginError') {
					toast.error(error?.response?.data?.error, {
						duration: 7000,
					});
					if (error?.response?.data?.type === 'INVALID_CODE') {
						await verify(phoneNumber, error?.response?.data?.error);
						return;
					}
				}
				throw error;
			}
		},
		[auth, loginWithSMS, verifyPhoneNumber]
	);

	const submitPhoneNumber = useCallback(
		async (phoneNumber: string) => {
			Analytics.track(EVENTS.BUTTON_CLICKED, {
				name: 'Login with phone number',
			});

			try {
				await verify(phoneNumber);
				router.pop();
			} finally {
				// logout user after magic login or else on next app mount wallet and magic both will be connected that can lead to weird bugs.
				magic?.user?.logout();
			}
		},
		[magic, verify, router]
	);

	return (
		<>
			<View tw="flex h-full px-4">
				<PhoneNumberPicker
					phone={phone}
					isSignup={false}
					handleSubmitPhoneNumber={submitPhoneNumber}
				/>
			</View>
			<Relayer />
		</>
	);
};

export default VerifyPhoneNumberModal;
