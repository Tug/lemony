import { Route } from '@diversifiedfinance/design-system/tab-view';

import DeleteAccountSettings from './delete';
import SocialSettings from './social';
import { MenuList } from '@diversifiedfinance/components';

export type SettingTabsSceneProps = {
	route: Route;
};

export const SettingTabsScene = ({ route }: SettingTabsSceneProps) => {
	const { key } = route;
	if (!key) {
		return null;
	}

	switch (key) {
		case 'deleteSettings':
			return <DeleteAccountSettings />;
		case 'socialSettings':
			return <SocialSettings />;
		case 'emailSettings':
		case 'phoneSettings':
			return <MenuList list={[route]} />;
		default:
			return null;
	}
};
