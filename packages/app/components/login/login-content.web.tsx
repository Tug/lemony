import { useLogin } from './use-login';
import { LoginComponent } from './login';

interface LoginProps {
	onLogin?: () => void;
	fromModal?: boolean;
	isSignup?: boolean;
}

export function LoginContent({
	onLogin,
	fromModal = true,
	isSignup = false,
}: LoginProps) {
	//#region hooks
	const { handleSubmitEmail, handleSubmitPhoneNumber, loading } =
		useLogin(onLogin);

	return (
		<LoginComponent
			handleSubmitEmail={handleSubmitEmail}
			handleSubmitPhoneNumber={handleSubmitPhoneNumber}
			loading={loading}
			isSignup={isSignup}
			fromModal={fromModal}
		/>
	);
}
