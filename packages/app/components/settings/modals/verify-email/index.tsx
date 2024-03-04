import { EmailInput } from './email-input';
import {
	useManageAccount,
	useManageAccountMagic,
} from '@diversifiedfinance/app/hooks/use-manage-account';
import { useMagic } from '@diversifiedfinance/app/lib/magic';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { View } from '@diversifiedfinance/design-system/view';
import { Analytics, EVENTS } from '@diversifiedfinance/app/lib/analytics';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createParam } from '@diversifiedfinance/app/navigation/lib/use-param';
import { useFeature } from '@growthbook/growthbook-react';
import { useAuthService } from '@diversifiedfinance/app/lib/auth-service';

const { useParam } = createParam<{ email: string }>();

const AddEmailModal = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const [emailDefault] = useParam('email');
	const { magic, Relayer: MagicRelayer } = useMagic();
	const isOTP = useFeature('twilio-otp-login').on;
	const { auth, Relayer: OTPRelayer } = useAuthService();
	const { verifyEmail: verifyEmailOTP } = useManageAccount();
	const { addEmail: verifyEmailMagic } = useManageAccountMagic();
	const verifyEmail = isOTP ? verifyEmailOTP : verifyEmailMagic;
	const loginWithEmail = isOTP
		? auth.loginWithEmail.bind(auth)
		: magic.auth.loginWithMagicLink.bind(magic.auth);
	const Relayer = isOTP ? OTPRelayer : MagicRelayer;

	const submitEmail = useCallback(
		async (email: string) => {
			Analytics.track(EVENTS.BUTTON_CLICKED, {
				name: 'Login with email',
			});

			try {
				const code = await loginWithEmail({ email });

				if (code) {
					await verifyEmail(email, code);
					router.pop();
				}
			} catch (error) {
				console.error(error);
			} finally {
				// logout user after magic login or else on next app mount wallet and magic both will be connected that can lead to weird bugs.
				magic?.user?.logout();
			}
		},
		[magic, verifyEmail, router, loginWithEmail]
	);

	return (
		<>
			<View tw="flex h-full px-4">
				<EmailInput
					defaultValue={emailDefault}
					key="login-email-field"
					onSubmit={submitEmail}
					label={t('Email address')}
					submitButtonLabel={t('Send')}
					inputMode="email"
					textContentType="emailAddress"
					placeholder={t('Enter your email address')}
				/>
			</View>
			<Relayer />
		</>
	);
};

export default AddEmailModal;
