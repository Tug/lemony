import { Route } from '@diversifiedfinance/design-system/tab-view';

import { Referral } from './referral';
import { Address } from './address';
import { PersonalInformation } from './personal-information';

export type SettingTabsSceneProps = {
	route: Route;
};

export const SettingTabsScene = ({ route: { key } }: SettingTabsSceneProps) => {
	if (!key) {
		return null;
	}

	switch (key) {
		case 'personal':
			return <PersonalInformation />;
		case 'address':
			return <Address />;
		case 'referral':
			return <Referral />;
	}

	return null;
};
