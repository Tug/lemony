import { useTranslation } from 'react-i18next';

export const useProfileSettingsRoutes = () => {
	const { t } = useTranslation();

	const accountSettingsRoutes = [
		{
			key: 'personal',
			title: t('Personal Information') as string,
		},
		{
			key: 'address',
			title: t('Residence Address') as string,
		},
		{
			key: 'referral',
			title: t('Referral') as string,
		},
	].filter(Boolean);

	return accountSettingsRoutes;
};
