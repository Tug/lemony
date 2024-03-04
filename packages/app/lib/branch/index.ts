import { Branch, getUrlFromBundle } from './client';
import { EVENTS, trackerEmitter } from '@diversifiedfinance/app/lib/analytics';
import type { AllRoutesParams } from '@diversifiedfinance/app/navigation/lib/get-path';
import { Profile } from '@diversifiedfinance/types';
import i18n from '@diversifiedfinance/app/lib/i18n';

export { Branch, getUrlFromBundle };

export const setUserId = (userId?: string) => {
	if (!userId) {
		return;
	}
	Branch.setIdentity(userId);
};

export const screenView = (
	properties: {
		screenName: keyof AllRoutesParams;
		path?: string;
		params?: any;
	},
	options: any
) => {
	const customData =
		properties.path || properties.params
			? {
					path: properties.path,
					...properties.params,
			  }
			: undefined;
	switch (properties.screenName) {
		case 'home':
			Branch.logEvent('ViewItems', customData);
			break;
		case 'project':
			Branch.logEvent('ViewItem', customData);
			break;
	}
};

export const buttonClick = (
	{ name, projectSlug }: { name: string; projectSlug?: string },
	options: any
) => {
	switch (name) {
		case 'checkout':
			Branch.logEvent('AddToCart', {
				description: projectSlug,
			});
			break;
		case 'buy':
			Branch.logEvent('InitiatePurchase', options);
			break;
		case 'share':
			Branch.logEvent('Share');
			break;
	}
};

export const createUserReferralLink = async ({
	profile_id,
	referralCode,
}: Pick<Profile, 'profile_id' | 'referralCode'>) => {
	return await Branch.link(
		{
			feature: 'sharing',
			channel: 'diversified',
			campaign: 'in-app-referral',
			tags: ['api-generated'],
			data: {
				alias: `invite/${referralCode}`,
				$canonical_identifier: `user/${profile_id}`,
				$og_title: i18n.t('Diversified Invite') as string,
				$og_description: i18n.t(
					'Join diversified now and earn 1 DIFIED'
				) as string,
				$og_image_url:
					'https://app.diversified.fi/icons/icon-bordered@2x.png',
				// $desktop_url: 'https://diversified.fi',
				$deeplink_path: `/onboarding/sign-up?code=${referralCode}`,
				$custom_fields: {
					userId: profile_id,
				},
				code: referralCode,
			},
		},
		{
			customMetadata: {
				userId: profile_id,
			},
		}
	);
};

// Revenue range is available for all Commerce Events where revenue is available on the event:
// Purchase
// Add to Cart
// Add to Wishlist
// View Cart
// Initiate Purchase
// Add Payment Info
// Click Ad
// View Ad
// Reserve
// Spend Credits

export const init = async () => {
	await Branch.init();

	return [
		trackerEmitter.addListener(
			'identify',
			(profile: Profile, extraTraits, referringParams) => {
				setUserId(profile.profile_id);
			}
		),
		trackerEmitter.addListener(
			'track',
			({
				event,
				properties,
				options,
			}: {
				event: string;
				properties: any;
				options: any;
			}) => {
				switch (event) {
					case EVENTS.SCREEN_VIEWED:
						screenView(properties, options);
						break;
					case EVENTS.BUTTON_CLICKED:
						buttonClick(properties, options);
						break;
				}
			}
		),
	];
};
