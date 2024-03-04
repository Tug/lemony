import {
	useModalScreenContext,
	withModalScreen,
} from '@diversifiedfinance/design-system/modal-screen';
import React, { useEffect } from 'react';
import { TokenClaim } from '@diversifiedfinance/app/components/token-claim';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import { useTranslation } from 'react-i18next';

export const TokenClaimPage = () => {
	useTrackPageViewed({ name: 'tokenClaim' });
	const { t } = useTranslation();
	const modalScreenContext = useModalScreenContext();
	useEffect(() => {
		modalScreenContext?.setTitle(t('Claim your DIFIED'));
	}, [modalScreenContext, t]);
	return <TokenClaim />;
};

export const TokenClaimScreen = withModalScreen(TokenClaimPage, {
	title: 'Claim your DIFIED',
	matchingPathname: '/token-claim/[slug]',
	matchingQueryParam: 'tokenClaimModal',
	snapPoints: ['80%'],
});
