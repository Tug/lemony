import { Route } from '@diversifiedfinance/design-system/tab-view';

import { AccountSettings } from './account';
import { BankingSettings } from './banking';
import { KYCSettings } from './kyc';
import { ProfileSettings } from './profile';
import { PreferencesSettings } from './preferences';
import { AboutSettings } from './about';
import { NotificationSettings } from './notifications';
import HowItWorks from '@diversifiedfinance/app/components/how-it-works';

export type SettingTabsSceneProps = {
	route: Route;
};

export const SettingTabsScene = ({ route: { key } }: SettingTabsSceneProps) => {
	if (!key) {
		return null;
	}

	switch (key) {
		case 'profileSettings':
			return <ProfileSettings />;
		case 'accountSettings':
			return <AccountSettings />;
		case 'bankingSettings':
			return <BankingSettings />;
		case 'kycSettings':
			return <KYCSettings />;
		case 'preferencesSettings':
			return <PreferencesSettings />;
		case 'aboutSettings':
			return <AboutSettings />;
		case 'notificationSettings':
			return <NotificationSettings />;
		case 'howItWorks':
			return <HowItWorks />;
	}

	return null;
};
