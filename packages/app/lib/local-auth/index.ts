import * as LocalAuthentication from 'expo-local-authentication';

export async function authenticate() {
	await LocalAuthentication.authenticateAsync();
}
