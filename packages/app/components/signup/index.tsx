import { LoginButton } from '../login/login-button';
import { LoginFooter } from '../login/login-footer';
import { LoginHeader } from '../login/login-header';
import { useLogin } from '../login/use-login';
import { View } from '@diversifiedfinance/design-system/view';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { LoginOverlays } from '../login/login-overlays';

interface LoginProps {
	onLogin?: () => void;
	fromModal?: boolean;
	isSignup?: boolean;
	magicCredential?: string;
}

export function Signup({
	onLogin,
	fromModal = true,
	isSignup = false,
}: LoginProps) {
	const [showEmailLogin, setShowEmailLogin] = useState(false);
	const { loading, handleSubmitWallet } = useLogin(onLogin, fromModal);

	return (
		<>
			<View>
				<View
					style={[
						styles.tabListItemContainer,
						{ display: showEmailLogin ? 'flex' : 'none' },
					]}
				>
					<LoginButton
						onPress={() => setShowEmailLogin(false)}
						type="social"
					/>
				</View>
				<View
					style={{
						display: showEmailLogin ? 'none' : 'flex',
					}}
				>
					<LoginHeader isSignup={isSignup} />
					<View style={styles.tabListItemContainer}>
						<View tw="mb-[16px]"></View>
						<View tw="mx-[-16px] mb-[8px] flex-row items-center">
							<View tw="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
						</View>
						<LoginButton
							onPress={() => setShowEmailLogin(true)}
							type="email"
						/>
						<LoginFooter />
					</View>
				</View>
			</View>
			<LoginOverlays loading={loading} />
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 16,
		minHeight: 400,
	},
	tabListItemContainer: {
		paddingHorizontal: 24,
		paddingBottom: 16,
		flex: 1,
		paddingTop: 16,
	},
});
