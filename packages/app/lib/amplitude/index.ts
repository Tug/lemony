import { amplitude } from './client';
import * as Types from '@amplitude/analytics-types';
import { Profile } from '@diversifiedfinance/types';
import { EVENTS, trackerEmitter } from '@diversifiedfinance/app/lib/analytics';
import { getAppVersion } from '@diversifiedfinance/app/utilities';
import { isServer } from '@diversifiedfinance/app/lib/is-server';

export const init = async () => {
	if (isServer) {
		return;
	}

	if (process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) {
		amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY, undefined, {
			serverZone:
				process.env.NEXT_PUBLIC_AMPLITUDE_SERVER_ZONE === 'US'
					? 'US'
					: 'EU',
		});
	}

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
				options?: Types.EventOptions;
			}) => {
				// if (event === EVENTS.USER_LOGIN) {
				// 	if (options?.user_id) {
				// 		amplitude.setUserId(options.user_id);
				// 	}
				// 	return;
				// }
				amplitude.track(event, properties, options);
				if (event === EVENTS.USER_LOGGED_OUT) {
					amplitude.reset();
				}
			}
		),
	];
};

function getDefaultTraitsForUser(profile?: Profile) {
	return {
		user_id: profile?.profile_id,
		app_version: getAppVersion(),
		verified: profile?.verified,
		email_verified: profile?.emailVerified,
		phone_verified: profile?.phoneNumberVerified,
		kyc_status: profile?.kycStatus,
		residence_city: profile?.address?.city,
		residence_country: profile?.address?.country?.code,
		residence_region: profile?.address?.region,
		locale: profile?.locale,
		disclaimer_accepted: profile?.disclaimerAccepted,
		terms_and_conditions_accepted: profile?.termsAndConditionsAccepted,
		disabled: profile?.disabled,
		nationality: profile?.nationality?.code,
		role: profile?.role,
		has_onboarded: profile?.has_onboarded,
		labels: profile?.labels,
		// user_properties: {},
	};
}

export function identify(profile?: Profile, extraTraits?: any, params?: any) {
	amplitude.setUserId(profile?.profile_id);
	const Id = new amplitude.Identify();
	Object.entries(params ?? {}).forEach(([key, value]) => {
		if (key.startsWith('~') || key.startsWith('+')) {
			Id.setOnce(`branch_${key.slice(1)}`, params[key]);
		} else if (params[key]) {
			Id.setOnce(key, params[key]);
		}
	});
	const traits = {
		...(profile && getDefaultTraitsForUser(profile)),
		...extraTraits,
	};
	Object.keys(traits || {}).forEach((key: string) => {
		Id.set(key, traits[key]);
	});
	amplitude.identify(Id);
}

export { amplitude, Types };
