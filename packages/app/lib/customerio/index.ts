import CustomerIO, { init as clientInit } from './client';
import { Profile } from '@diversifiedfinance/types';
import { EVENTS, trackerEmitter } from '@diversifiedfinance/app/lib/analytics';
import * as Types from '@amplitude/analytics-types';

export const init = async () => {
	clientInit?.();

	return [
		trackerEmitter.addListener('identify', identify),
		trackerEmitter.addListener(
			'track',
			({
				event,
				properties,
				options,
			}: {
				event: string;
				properties: any;
				options: Types.EventOptions;
			}) => {
				if (event === EVENTS.USER_LOGIN) {
					return;
				}
				if (event === EVENTS.SCREEN_VIEWED) {
					CustomerIO.screen(properties.screenName, properties);
					return;
				}
				if (event === EVENTS.NOTIFICATION_DELIVERED) {
					CustomerIO.pushMessaging().trackNotificationReceived(
						properties.payload
					);
					CustomerIO.track(event, properties);
					return;
				}
				if (event === EVENTS.NOTIFICATION_OPENED) {
					CustomerIO.pushMessaging().trackNotificationResponseReceived(
						properties.payload
					);
					CustomerIO.track(event, properties);
					return;
				}
				CustomerIO.track(event, properties);
			}
		),
	];
};

function toCustomerIOProfile(profile: Profile) {
	return {
		...profile,
		externalId: profile.profile_id,
		createdAt: profile.createdAt ? new Date(profile.createdAt) : null,
		updatedAt: profile.updatedAt ? new Date(profile.updatedAt) : null,
		birthDate: profile.birthDate ? new Date(profile.birthDate) : null,
		kycUpdatedAt: profile.kycUpdatedAt
			? new Date(profile.kycUpdatedAt)
			: null,
	};
}

export function identify(
	profile?: Profile,
	extraTraits?: any,
	referringParams?: any
) {
	if (!profile?.profile_id) {
		return;
	}
	CustomerIO.identify(profile?.profile_id, toCustomerIOProfile(profile));
}

export default CustomerIO;
