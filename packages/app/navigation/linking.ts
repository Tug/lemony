// import { handleResponse } from '@coinbase/wallet-mobile-sdk';
import type { LinkingOptions } from '@diversifiedfinance/app/lib/react-navigation/native';
import { getStateFromPath } from '@diversifiedfinance/app/lib/react-navigation/native';
import * as Linking from 'expo-linking';
import debounce from 'lodash/debounce';
import config from './screens.config';
import { Branch, getUrlFromBundle } from '@diversifiedfinance/app/lib/branch';
// import { APP_SCHEME } from '@diversifiedfinance/app/utilities';
import { Analytics, EVENTS } from '@diversifiedfinance/app/lib/analytics';

const domainUrl = process.env.NEXT_PUBLIC_WEBSITE_DOMAIN;

const withRewrites = (unparsedPath: string): string => {
	return unparsedPath;
};

const trackDeepLink = (url: string): void => {
	const { hostname: route, queryParams: params } = Linking.parse(url);
	if (__DEV__) {
		console.log('🎯 Deep link received', url, route, params);
	}
	Analytics.track(EVENTS.DEEP_LINK_OPENED, {
		route,
		params,
	});
};

const linking: LinkingOptions<ReactNavigation.RootParamList> = {
	prefixes: [
		Linking.createURL('/'),
		`https://${domainUrl}/`,
		`https://*.${domainUrl}/`,
		// http, including subdomains like www.
		`http://${domainUrl}/`,
		`http://*.${domainUrl}/`,
	],
	config,
	getStateFromPath,
	async getInitialURL() {
		const params = await Branch.getLatestReferringParams(false);
		let url = getUrlFromBundle({ params }) ?? null;
		if (!url) {
			url = await Linking.getInitialURL();
		}
		// const initialURL = url ? new URL(url, `${APP_SCHEME}://`) : null;
		// if (initialURL && handleResponse(initialURL)) {
		// 	// URL handled by Wallet Mobile SDK
		// 	return null;
		// }
		if (url) {
			trackDeepLink(url);
			const urlObj = new URL(url);
			urlObj.pathname = withRewrites(urlObj.pathname);
			return urlObj.href;
		}

		return url;
	},
	subscribe(listener) {
		const linkingSubscription = Linking.addEventListener(
			'url',
			({ url }) => {
				// const handledByMobileSDK = handleResponse(new URL(url));
				// if (!handledByMobileSDK) {
				// 	if (url) {
				// 		const urlObj = new URL(url);
				// 		urlObj.pathname = withRewrites(urlObj.pathname);
				// 		listener(urlObj.href);
				// 	} else {
				if (url) {
					trackDeepLink(url);
				}
				listener(url);
				// 	}
				// }
			}
		);

		// Listen to incoming links from Branch Quick Links
		// From: https://github.com/adriaandebolle/react-navigation.github.io/blob/main/versioned_docs/version-6.x/deep-linking.md
		let branchInitialized = false;
		const branchUnsubscribe = Branch.subscribe(
			debounce(
				(bundle) => {
					// the first value is not an event, it's the cached initial url
					if (!branchInitialized) {
						branchInitialized = true;
						return;
					}

					const url = getUrlFromBundle(bundle);
					if (url) {
						listener(url);
					}
				},
				2000,
				{ leading: true }
			)
		);

		return function cleanup() {
			linkingSubscription.remove();
			branchUnsubscribe();
		};
	},
};

export { linking };
