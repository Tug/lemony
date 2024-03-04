import { LoginButton } from './login-button';
import { useAuth } from '@diversifiedfinance/app/hooks/auth/use-auth';
import { LOGIN_MAGIC_ENDPOINT } from '@diversifiedfinance/app/hooks/auth/use-magic-login';
import { useMagicSocialAuth } from '@diversifiedfinance/app/lib/social-logins';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { useMagic } from '@diversifiedfinance/app/lib/magic';

export const LoginWithApple = ({ onLogin }: { onLogin?: () => void }) => {
	const { setAuthenticationStatus, login, logout } = useAuth();
	const router = useRouter();
	const { performMagicAuthWithApple } = useMagicSocialAuth();
	// const { setWeb3 } = useWeb3();
	const { magic } = useMagic();
	return (
		<LoginButton
			type="apple"
			onPress={async () => {
				try {
					setAuthenticationStatus('AUTHENTICATING');
					const result = await performMagicAuthWithApple();
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
