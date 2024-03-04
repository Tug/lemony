import { ReferAFriend } from '@diversifiedfinance/app/components/refer-a-friend';
import { withModalScreen } from '@diversifiedfinance/design-system/modal-screen';
import React from 'react';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';

export const ReferAFriendPage = () => {
	useTrackPageViewed({ name: 'referAFriend' });
	return <ReferAFriend />;
};

export const ReferAFriendScreen = withModalScreen(ReferAFriendPage, {
	title: 'Refer a friend',
	matchingPathname: '/refer-a-friend',
	matchingQueryParam: 'referAFriendModal',
	snapPoints: ['70%', '90%'],
});
