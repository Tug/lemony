import AddEmailModal from '../../../components/settings/modals/verify-email';
import {
	useModalScreenContext,
	withModalScreen,
} from '@diversifiedfinance/design-system/modal-screen';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const VerifyEmailPage = () => {
	useTrackPageViewed({ name: 'verifyEmail' });
	const { t } = useTranslation();
	const modalScreenContext = useModalScreenContext();
	useEffect(() => {
		modalScreenContext?.setTitle(t('Verify Email'));
	}, [modalScreenContext, t]);
	return <AddEmailModal />;
};

export const VerifyEmailScreen = withModalScreen(VerifyEmailPage, {
	title: 'Verify Email',
	matchingPathname: '/settings/account',
	matchingQueryParam: 'verifyEmailModal',
	snapPoints: ['90%'],
});
