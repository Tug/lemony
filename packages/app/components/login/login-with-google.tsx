import { LoginButton } from './login-button';
import { useAuth } from '@diversifiedfinance/app/hooks/auth/use-auth';
import { LOGIN_MAGIC_ENDPOINT } from '@diversifiedfinance/app/hooks/auth/use-magic-login';
import { useMagicSocialAuth } from '@diversifiedfinance/app/lib/social-logins';

export const LoginWithGoogle = ({ onLogin }: { onLogin?: () => void }) => {
	const { setAuthenticationStatus, login, logout } = useAuth();
	const { performMagicAuthWithGoogle } = useMagicSocialAuth();

	return (
		<LoginButton
			type="google"
			onPress={async () => {
				try {
					setAuthenticationStatus('AUTHENTICATING');
					const result = await performMagicAuthWithGoogle();
					const idToken = result.magic.idToken;
					await login(LOGIN_MAGIC_ENDPOINT, {
						didToken: idToken,
					});
					onLogin?.();
				} catch (err) {
					console.error(err);
					setAuthenticationStatus('UNAUTHENTICATED');
				}
			}}
		/>
	);
};
