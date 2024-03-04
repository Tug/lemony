import React from 'react';
import { TopCarousel } from './carousel';
import {
	useBankAccounts,
	useMyTokenClaims,
} from '@diversifiedfinance/app/hooks/api-hooks';
import { useNotifications } from '@diversifiedfinance/app/hooks/use-notifications';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { useTranslation } from 'react-i18next';
import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import { useVIPUserLevel } from '@diversifiedfinance/app/hooks/use-vip-user-level';
import { printMoney } from '@diversifiedfinance/app/lib/money';

export function TopCarouselWithData() {
	const { i18n, t } = useTranslation();
	const { user } = useUser();
	const {
		benefits: { difiedPerReferral },
	} = useVIPUserLevel();
	const isKYCCompleted = user?.data.profile.kycStatus === 'completed';
	const { data: tokenClaims } = useMyTokenClaims();
	const { data: notifications } = useNotifications();
	const carouselNotifications = notifications?.filter(
		(notification) => notification.type === 'special_home_carousel'
	);
	const { data: bankAccounts, isLoading: isBankAccountLoading } =
		useBankAccounts();
	const hasBankAccount = bankAccounts && bankAccounts.length > 0;
	const shouldCompleteProfile = !isBankAccountLoading && !hasBankAccount;
	const data = [
		!isKYCCompleted && {
			icon: 'p-check',
			title: t('KYC Required'),
			description: t('Please follow the KYC procedure before investing.'),
			path: getPath('kycSettings'),
		},
		shouldCompleteProfile && {
			icon: 'alert',
			title: t('Complete your profile'),
			description: t('You have no bank account registered for payout!'),
			path: getPath('addBankAccount'),
			tw: 'bg-themeOrange dark:bg-themeYellow',
			textTw: 'text-white dark:text-black',
		},
		...(tokenClaims ?? []).map((tokenClaim) => ({
			icon: 'casino-chip',
			title: t('Redeem your referral bonus'),
			description:
				// we have to manually add the plurals here because the keys are synced with locize
				tokenClaim.quantity === 1
					? t(
							'You won {{count, number(minimumFractionDigits: 0, maximumFractionDigits: 4)}} DIFIED, get it now!_one',
							{
								count: 1,
							}
					  )
					: t(
							'You won {{count, number(minimumFractionDigits: 0, maximumFractionDigits: 4)}} DIFIED, get it now!_other',
							{
								count: tokenClaim.quantity,
							}
					  ),
			path: getPath('tokenClaim', { slug: tokenClaim.projectSlug }),
		})),
		...(carouselNotifications ?? []).map((notification) => ({
			icon: notification.icon ?? 'comment-v2',
			title: t(notification.title),
			description: t(notification.description),
			path: t(notification.path),
		})),
		!user?.data?.profile?.emailVerified && {
			icon: 'newsletter',
			title: t('Account Security'),
			description: t('Verify your email to secure your account'),
			path: getPath('verifyEmail', undefined, {
				email: user?.data?.profile.email ?? '',
			}),
		},
		!user?.data?.profile?.phoneNumberVerified && {
			icon: 'p-check',
			title: t('Account Security'),
			description: t('Verify your phone number to secure your account'),
			path: getPath('verifyPhoneNumber', undefined, {
				phone: user?.data?.profile.phoneNumber ?? '',
			}),
		},
		{
			icon: 'handshake',
			title: t('Refer a friend'),
			description: t(
				'Recommend Diversified to your friends and receive {{count}} DIFIED',
				{ count: difiedPerReferral }
			),
			path: getPath('referAFriend'),
		},
	].filter(Boolean);

	if (data.length === 0) {
		return null;
	}

	return <TopCarousel data={data} />;
}
