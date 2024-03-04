import { LoginModal } from './login-modal';
import { LoginContent } from './login-content';

interface LoginProps {
	onLogin?: () => void;
	fromModal?: boolean;
	isSignup?: boolean;
}

export function Login({
	onLogin,
	fromModal = true,
	isSignup = false,
}: LoginProps) {
	return (
		<LoginModal>
			<LoginContent
				onLogin={onLogin}
				fromModal={fromModal}
				isSignup={isSignup}
			/>
		</LoginModal>
	);
}
