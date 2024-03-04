import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { useTranslation } from 'react-i18next';

export const useAccountSettingsRoutes = () => {
	const { t } = useTranslation();
	const { user } = useUser();
	const email = Boolean(user?.data.profile.emailVerified)
		? user?.data.profile.email
		: Boolean(user?.data.profile.email)
		? `${user?.data.profile.email} (${t('Unverified')})`
		: '';
	const phoneNumber = Boolean(user?.data.profile.phoneNumberVerified)
		? user?.data.profile.phoneNumber
		: Boolean(user?.data.profile.phoneNumber)
		? `${user?.data.profile.phoneNumber} (${t('Unverified')})`
		: '';
	const hasApple = user?.data.profile.wallet_addresses_v2.some(
		(wallet) => wallet.is_apple
	);
	const hasGoogle = user?.data.profile.wallet_addresses_v2.some(
		(wallet) => wallet.is_apple
	);
	const socialAccountsConnected = [hasApple && 'Apple', hasGoogle && 'Google']
		.filter(Boolean)
		.join(', ');

	const accountSettingsRoutes = [
		{
			key: 'emailSettings',
			title: t('Email'),
			value: email,
			// href: getPath('verifyEmail', undefined, {
			// 	email: user?.data.profile.email ?? '',
			// 	verifyEmailModal: true,
			// }),
			href: {
				pathname: getPath('verifyEmail'),
				query: {
					email: user?.data.profile.email ?? '',
					verifyEmailModal: true,
				},
			},
			valueTw: !Boolean(user?.data.profile.emailVerified)
				? 'text-danger-500'
				: '',
		},
		{
			key: 'phoneSettings',
			title: t('Phone Number'),
			value: phoneNumber,
			href: {
				pathname: getPath('verifyPhoneNumber'),
				query: {
					phone: user?.data.profile.phoneNumber ?? '',
					verifyPhoneNumberModal: true,
				},
			},
			valueTw: !Boolean(user?.data.profile.emailVerified)
				? 'text-danger-500'
				: '',
		},
		process.env.STAGE === 'development'
			? {
					key: 'socialSettings',
					title: t('Linked Accounts'),
					value: socialAccountsConnected,
					href: getPath('socialSettings'),
			  }
			: undefined,
		{
			key: 'deleteSettings',
			title: t('Close account permanently'),
			href: getPath('deleteSettings'),
			labelTw: 'text-danger-500',
		},
	].filter(Boolean);

	return accountSettingsRoutes;
};
