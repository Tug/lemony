import BranchSDK, {
	BranchSubscriptionEvent,
	BranchEvent,
	BranchEventParams,
} from 'react-native-branch';
import * as Linking from 'expo-linking';
import { BranchEventType } from '@diversifiedfinance/app/lib/branch/types';
import { APP_SCHEME } from '@diversifiedfinance/app/utilities';
import type { DeepLinkData } from 'branch-sdk';

const domainUrl = process.env.NEXT_PUBLIC_WEBSITE_DOMAIN;
const uriRegexes = [`https?://${domainUrl}/(.*)`, `${APP_SCHEME}://(.*)`].map(
	(pattern) => new RegExp(pattern)
);

export const Branch = Object.assign(
	Object.create(Object.getPrototypeOf(BranchSDK)),
	{
		...BranchSDK,
		async init() {
			// init is done natively, see expo config
		},
		async logEvent(eventType: BranchEventType, params?: BranchEventParams) {
			const event = new BranchEvent(
				BranchEvent[eventType],
				null!,
				params
			);
			return event.logEvent();
		},
		async link(deepLinkData: DeepLinkData) {
			const customData = Object.fromEntries(
				Object.entries(deepLinkData.data).filter(
					([key, _]) => !key.startsWith('$')
				)
			);
			const buo = await Branch.createBranchUniversalObject(
				deepLinkData.data.$canonical_identifier,
				{
					title: deepLinkData.data.$og_title,
					contentDescription: deepLinkData.data.$og_description,
					contentImageUrl: deepLinkData.data.$og_image_url,
					...(deepLinkData.data.$custom_fields && {
						contentMetadata: {
							customMetadata: deepLinkData.data.$custom_fields,
						},
					}),
				}
			);

			const linkProperties = {
				feature: deepLinkData.feature,
				channel: deepLinkData.channel,
				campaign: deepLinkData.campaign,
				alias: deepLinkData.data.alias,
				stage: deepLinkData.stage,
				tags: deepLinkData.tags,
			};

			const controlParams = {
				$deeplink_path: deepLinkData.data.$deeplink_path,
				$canonical_url: deepLinkData.data.$canonical_url,
				$desktop_url: deepLinkData.data.$desktop_url,
				...customData,
			};

			try {
				return await buo.generateShortUrl(
					linkProperties,
					controlParams
				);
			} catch (err) {
				const branchAppDomain =
					process.env.NEXT_PUBLIC_BRANCH_APP_DOMAIN ??
					'diversified.app.link';
				return {
					url: `https://${branchAppDomain}/${linkProperties.alias}`,
				};
			}
		},
		data: () => BranchSDK.getLatestReferringParams(),
		first: () => BranchSDK.getFirstReferringParams(),
	}
);

const matchURI = (uri: string) => {
	for (const regex of uriRegexes) {
		const match = regex.exec(uri);
		if (match) {
			return `/${match[1]}`;
		}
	}
	return undefined;
};

function getOriginalQuery(params: BranchSubscriptionEvent['params']) {
	const BRANCH_SPECIAL_CHARS = '$+~';
	const output: any = {};
	for (const key in params) {
		if (!BRANCH_SPECIAL_CHARS.includes(key[0])) {
			output[key] = params[key];
		}
	}
	return output;
}

export function getUrlFromBundle({
	error,
	params,
	uri,
}: BranchSubscriptionEvent) {
	if (error) {
		console.error(
			'subscribe onOpenComplete, Error from opening uri: ' +
				uri +
				' error: ' +
				error
		);
		return;
	}

	// `+clicked_branch_link` indicates initialization success
	// and some other conditions. No link was opened.
	if (!params || !params['+clicked_branch_link']) {
		return;
	}

	if (params['+non_branch_link']) {
		console.log('non_branch_link: ' + uri);
		// Route based on non-Branch links
		const nonBranchUrl = params['+non_branch_link'];
		return matchURI(nonBranchUrl as string);
	}

	// handle params
	const deepLinkPath = params.$deeplink_path as string;
	const canonicalUrl = (params.$canonical_url ?? params.navigate) as string;

	if (deepLinkPath || canonicalUrl) {
		return deepLinkPath
			? Linking.createURL(deepLinkPath, {
					queryParams: getOriginalQuery(params),
			  })
			: canonicalUrl;
	}

	if (params['~referring_link']) {
		return matchURI(params['~referring_link']);
	}
}
