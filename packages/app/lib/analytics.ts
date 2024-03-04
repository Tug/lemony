import { useEffect } from 'react';
import {
	init as amplitudeInit,
	Types,
} from '@diversifiedfinance/app/lib/amplitude';
import { init as branchInit, Branch } from '@diversifiedfinance/app/lib/branch';
import { init as customerIOInit } from '@diversifiedfinance/app/lib/customerio';
import getPath, {
	AllRoutesParams,
} from '@diversifiedfinance/app/navigation/lib/get-path';
import { EventEmitter } from 'eventemitter3';
import { Profile } from '@diversifiedfinance/types';

export const trackerEmitter = new EventEmitter();

export const init = () => {
	trackerEmitter.removeAllListeners();

	return Promise.all([branchInit(), amplitudeInit(), customerIOInit()]);
};

const track = (
	event: string,
	properties?: any,
	options?: Types.EventOptions
) => {
	trackerEmitter.emit('track', {
		event,
		properties,
		options,
	});
};

const identify = async (profile?: Profile, extraTraits?: any) => {
	const referringParams = await Branch.getFirstReferringParams();
	trackerEmitter.emit('identify', profile, extraTraits, referringParams);
};

const reset = () => {
	track(EVENTS.USER_LOGGED_OUT);
};

export const useTrackPageViewed = ({
	name,
	params,
}: {
	name: keyof AllRoutesParams;
	params?: any;
}) => {
	useEffect(() => {
		track(EVENTS.SCREEN_VIEWED, {
			screenName: name,
			path: getPath(name, params),
			params,
		});
	}, [name, params]);
};

export const useTrackScreenViewed = ({ name }: { name: string }) => {
	useEffect(() => {
		track(EVENTS.SCREEN_VIEWED, {
			screenName: name,
		});
	}, [name]);
};

export const EVENTS = {
	SCREEN_VIEWED: 'Screen Viewed',
	BUTTON_CLICKED: 'Button Clicked',
	BUTTON_CLICKED_FAILURE: 'Button Clicked Failure',
	USER_LOGGED_OUT: 'User Logged Out',
	USER_LOGIN: 'User Logged In',
	USER_FINISHED_ONBOARDING: 'User Finished Onboarding',
	USER_SHARED_INVITE: 'User Shared Invite',
	USER_SHARED_URL: 'User Shared URL',
	USER_DISMISSED: 'User Dismissed',
	KYC_EVENT: 'KYC Event',
	PURCHASE: 'purchase',
	TOKEN_CLAIM: 'Token Claim',
	DEEP_LINK_OPENED: 'Deep Link Opened',
	NOTIFICATION_DELIVERED: 'Notification Received',
	NOTIFICATION_OPENED: 'Notification Opened',
};

export const Analytics = { track, identify, reset, events: EVENTS };
