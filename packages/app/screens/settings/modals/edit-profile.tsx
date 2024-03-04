import { EditProfile } from '@diversifiedfinance/app/components/edit-profile';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import {
	useModalScreenContext,
	withModalScreen,
} from '@diversifiedfinance/design-system/modal-screen';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const EditProfilePage = () => {
	useTrackPageViewed({ name: 'editProfile' });
	const { t } = useTranslation();
	const modalScreenContext = useModalScreenContext();
	useEffect(() => {
		modalScreenContext?.setTitle(t('Edit Personal Information'));
	}, [modalScreenContext, t]);
	return <EditProfile />;
};
export const EditProfileScreen = withModalScreen(EditProfilePage, {
	title: 'Edit Personal Information',
	matchingPathname: '/settings/profile/edit',
	matchingQueryParam: 'editProfileModal',
	enableContentPanningGesture: false,
	snapPoints: ['100%'],
	disableBackdropPress: true,
	web_height: `h-[90vh]`,
});
