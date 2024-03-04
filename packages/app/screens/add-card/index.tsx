import { AddCardBottomSheet } from '@diversifiedfinance/app/components/payment/add-card';
import {
	useModalScreenContext,
	withModalScreen,
} from '@diversifiedfinance/design-system/modal-screen';
import React, { useEffect } from 'react';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import { useTranslation } from 'react-i18next';

export const AddCardPage = () => {
	useTrackPageViewed({ name: 'addCard' });
	const { t } = useTranslation();
	const modalScreenContext = useModalScreenContext();
	useEffect(() => {
		modalScreenContext?.setTitle(t('Add new card'));
	}, [modalScreenContext, t]);
	return <AddCardBottomSheet />;
};

export const AddCardScreen = withModalScreen(AddCardPage, {
	title: 'Add new card',
	matchingPathname: '/add-card',
	matchingQueryParam: 'addCardModal',
	snapPoints: ['100%'],
});
