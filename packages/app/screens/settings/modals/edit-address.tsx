import { EditAddress } from '@diversifiedfinance/app/components/edit-address';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import {
	useModalScreenContext,
	withModalScreen,
} from '@diversifiedfinance/design-system/modal-screen';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const EditAddressPage = () => {
	useTrackPageViewed({ name: 'editAddress' });
	const { t } = useTranslation();
	const modalScreenContext = useModalScreenContext();
	useEffect(() => {
		modalScreenContext?.setTitle(t('Edit Residence Address'));
	}, [modalScreenContext, t]);
	return <EditAddress />;
};

export const EditAddressScreen = withModalScreen(EditAddressPage, {
	title: 'Edit Residence Address',
	matchingPathname: '/settings/profile/address/edit',
	matchingQueryParam: 'editAddressModal',
	enableContentPanningGesture: false,
	snapPoints: ['100%'],
	disableBackdropPress: true,
	web_height: `h-[90vh]`,
});
