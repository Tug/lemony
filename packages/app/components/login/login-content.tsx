import { useLogin } from './use-login';
import { LoginComponent } from './login';

interface LoginProps {
	onLogin?: () => void;
	fromModal?: boolean;
	isSignup?: boolean;
	magicCredential?: string;
}

export function LoginContent({
	onLogin,
	fromModal = true,
	isSignup = false,
}: LoginProps) {
	const { loading, handleSubmitEmail, handleSubmitPhoneNumber } = useLogin(
		onLogin,
		fromModal
	);

	return (
		<LoginComponent
			handleSubmitEmail={handleSubmitEmail}
			handleSubmitPhoneNumber={handleSubmitPhoneNumber}
			loading={loading}
			isSignup={isSignup}
			fromModal={fromModal}
			onLogin={onLogin}
		/>
	);
}
