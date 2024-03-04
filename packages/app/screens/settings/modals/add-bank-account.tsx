import { AddBankAccount } from '@diversifiedfinance/app/components/settings/modals/add-bank-account';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import {
	useModalScreenContext,
	withModalScreen,
} from '@diversifiedfinance/design-system/modal-screen';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const AddBankAccountPage = () => {
	useTrackPageViewed({ name: 'addBankAccount' });
	const { t } = useTranslation();
	const modalScreenContext = useModalScreenContext();
	useEffect(() => {
		modalScreenContext?.setTitle(t('Add Bank Account'));
	}, [modalScreenContext, t]);
	return <AddBankAccount />;
};

export const AddBankAccountScreen = withModalScreen(AddBankAccountPage, {
	title: 'Add Bank Account',
	matchingPathname: '/settings/add-bank-account',
	matchingQueryParam: 'addBankAccountModal',
	snapPoints: [630, '90%', '100%'],
	web_height: `h-[90vh]`,
});
