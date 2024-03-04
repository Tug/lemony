import VerifyPhoneNumberModal from '@diversifiedfinance/app/components/settings/modals/verify-phone-number';
import {
	useModalScreenContext,
	withModalScreen,
} from '@diversifiedfinance/design-system/modal-screen';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export const VerifyPhoneNumberPage = () => {
	useTrackPageViewed({ name: 'verifyPhoneNumber' });
	const { t } = useTranslation();
	const modalScreenContext = useModalScreenContext();
	useEffect(() => {
		modalScreenContext?.setTitle(t('Verify Phone Number'));
	}, [modalScreenContext, t]);
	return <VerifyPhoneNumberModal />;
};

export const VerifyPhoneNumberScreen = withModalScreen(VerifyPhoneNumberPage, {
	title: 'Verify Phone Number',
	matchingPathname: '/settings/account/verify-phone-number',
	matchingQueryParam: 'verifyPhoneNumberModal',
	snapPoints: ['90%'],
});
