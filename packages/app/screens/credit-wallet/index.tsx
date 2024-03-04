import { CreditWallet } from '@diversifiedfinance/app/components/payment/credit-wallet';
import {
	useModalScreenContext,
	withModalScreen,
} from '@diversifiedfinance/design-system/modal-screen';
import React, { Suspense, useEffect } from 'react';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

export const CreditWalletPage = () => {
	useTrackPageViewed({ name: 'creditWallet' });
	const { t } = useTranslation();
	const modalScreenContext = useModalScreenContext();
	useEffect(() => {
		modalScreenContext?.setTitle(t('Credit My Wallet'));
	}, [modalScreenContext, t]);
	return <CreditWallet />;
};

export const CreditWalletScreen = withModalScreen(CreditWalletPage, {
	title: 'Credit My Wallet',
	matchingPathname: '/credit-wallet',
	matchingQueryParam: 'creditWalletModal',
	snapPoints: ['100%'],
	// Need to disable content panning gesture for now on android as it swallows events for the Slider
	enableContentPanningGesture: Platform.OS !== 'android',
});
