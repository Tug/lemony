import { getCountryList } from '@diversifiedfinance/design-system/country-code-picker/country-code-data';
import {
	Profile,
	Project,
	ProjectsFilterOption,
} from '@diversifiedfinance/types';
import { ResizeMode } from 'expo-av';
import type { ImageProps } from 'expo-image';
import * as React from 'react';
import { Platform } from 'react-native';
import i18n, {
	config as i18nConfig,
	getLang,
} from '@diversifiedfinance/app/lib/i18n';
import Constants from 'expo-constants';
import packageJson from '../../package.json';

export const formatAddressShort = (address?: string | null) => {
	if (!address) return null;

	// Skip over ENS names
	if (address.includes('.')) return address;

	return `${address.slice(0, 4)}…${address.slice(
		address.length - 4,
		address.length
	)}`;
};

const DEFAULT_PROFILE_PIC = `https://app.diversified.fi/images/profile_placeholder2.jpg`;

export const getProfileImage = (profile?: Profile) => {
	return profile?.img_url ?? DEFAULT_PROFILE_PIC;
};

type ReactChildArray = ReturnType<typeof React.Children.toArray>;

export function flattenChildren(children: React.ReactNode): ReactChildArray {
	const childrenArray = React.Children.toArray(children);
	return childrenArray.reduce((flatChildren: ReactChildArray, child) => {
		if ((child as React.ReactElement<any>).type === React.Fragment) {
			return flatChildren.concat(
				flattenChildren(
					(child as React.ReactElement<any>).props.children
				)
			);
		}
		flatChildren.push(child);
		return flatChildren;
	}, []);
}

// Format big numbers
export function formatNumber(number: number) {
	if (number > 1000000) {
		return `${(number / 1000000).toFixed(1)}m`;
	} else if (number > 1000) {
		return `${(number / 1000).toFixed(1)}k`;
	}
	return number;
}

export const MATIC_CHAIN_ID =
	process.env.NEXT_PUBLIC_CHAIN_ID === 'mumbai' ? 80001 : 137;

export const MATIC_CHAIN_DETAILS = {
	chainId: `0x${MATIC_CHAIN_ID.toString(16)}`,
	chainName:
		process.env.NEXT_PUBLIC_CHAIN_ID === 'mumbai'
			? 'Mumbai Testnet'
			: 'Polygon',
	nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
	rpcUrls:
		process.env.NEXT_PUBLIC_CHAIN_ID === 'mumbai'
			? ['https://matic-mumbai.chainstacklabs.com']
			: ['https://polygon-rpc.com'],
	blockExplorerUrls: [
		process.env.NEXT_PUBLIC_CHAIN_ID === 'mumbai'
			? 'https://mumbai.polygonscan.com/'
			: 'https://polygonscan.com/',
	],
};

export async function delay(ms: number) {
	return await new Promise((resolve) => setTimeout(resolve, ms));
}

export function isAndroid(): boolean {
	return (
		typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
	);
}

export function isSmallIOS(): boolean {
	return (
		typeof navigator !== 'undefined' &&
		/iPhone|iPod/.test(navigator.userAgent)
	);
}

export function isLargeIOS(): boolean {
	return typeof navigator !== 'undefined' && /iPad/.test(navigator.userAgent);
}

export function isIOS(): boolean {
	return isSmallIOS() || isLargeIOS();
}
export function isSafari(): boolean {
	return (
		typeof navigator !== 'undefined' &&
		/Safari/.test(navigator.userAgent) &&
		!/Chrome/.test(navigator.userAgent)
	);
}

export function isMobileWeb(): boolean {
	return Platform.OS === 'web' && (isAndroid() || isIOS());
}

export function isDesktopWeb(): boolean {
	return Platform.OS === 'web' && !isAndroid() && !isIOS();
}

// TODO: https://github.com/LedgerHQ/ledgerjs/issues/466
export const ledgerWalletHack = (signature?: string) => {
	if (signature) {
		const lastByteOfSignature = signature.slice(-2);
		if (lastByteOfSignature === '00' || lastByteOfSignature === '01') {
			const temp = parseInt(lastByteOfSignature, 16) + 27;
			const newSignature = signature.slice(0, -2) + temp.toString(16);
			return newSignature;
		}
	}

	return signature;
};

export function isClassComponent(component: any) {
	return (
		typeof component === 'function' &&
		!!component.prototype.isReactComponent
	);
}

export function isFunctionComponent(component: any) {
	return (
		typeof component === 'function' &&
		String(component).includes('return React.createElement')
	);
}

export function isReactComponent(component: any) {
	if (!component) return false;
	return isClassComponent(component) || isFunctionComponent(component);
}

export const obfuscatePhoneNumber = (phoneNumber: string) => {
	if (!phoneNumber) return '';
	const obfuscated =
		phoneNumber.slice(0, 3) +
		'*'.repeat(phoneNumber.length - 5) +
		phoneNumber.slice(-2);

	return obfuscated;
};

export function formatDateRelativeWithIntl(
	isoDateString: string,
	t = i18n.t
): string {
	const date = new Date(isoDateString);
	const now = new Date();
	const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
	const diffInMinutes = diffInSeconds / 60;
	const diffInHours = diffInMinutes / 60;
	const diffInDays = Math.floor(diffInHours / 24);

	if (diffInMinutes < 1) {
		return t('now');
	} else if (diffInDays < 1) {
		const timeFormatter = new Intl.DateTimeFormat(i18n.language, {
			hour: '2-digit',
			minute: '2-digit',
		});
		return timeFormatter.format(date);
	} else if (diffInDays >= 1 && diffInDays < 7) {
		return `${diffInDays}d`;
	}
	const diffInWeeks = Math.floor(diffInDays / 7);
	const diffInMonths = Math.floor(diffInDays / 30.44);
	const diffInYears = Math.floor(diffInDays / 365.25);

	if (diffInWeeks < 4) {
		return `${diffInWeeks}w`;
	} else if (diffInMonths < 1) {
		return `${diffInWeeks}w`;
	} else if (diffInMonths < 12) {
		return `${diffInMonths}m`;
	}
	return `${diffInYears}y`;
}

export function getRandomNumber(min = 50, max = 26000) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const APP_SCHEME_PREFIX = process.env.SCHEME ?? 'fi.diversified.app';
export const APP_SCHEME = `${APP_SCHEME_PREFIX}${
	process.env.STAGE !== 'production' ? `.${process.env.STAGE}` : ''
}`;

export const OAUTH_REDIRECT_URI = Platform.select({
	web: `${__DEV__ ? 'http' : 'https'}://${
		process.env.NEXT_PUBLIC_WEBSITE_DOMAIN ?? 'app.diversified.fi'
	}/magic-oauth-redirect`,
	default: `${APP_SCHEME}://magic-oauth-redirect`,
});

export const isProfileIncomplete = (profile?: Profile) => {
	return profile
		? !profile.email ||
				!profile.firstName ||
				!profile.lastName ||
				!profile.countryOfResidence
		: undefined;
};

export const hasNotAcceptedTerms = (profile?: Profile) => {
	return profile
		? !profile.termsAndConditionsAccepted || !profile.disclaimerAccepted
		: undefined;
};

export const contentFitToresizeMode = (
	resizeMode: ImageProps['contentFit']
) => {
	switch (resizeMode) {
		case 'cover':
			return ResizeMode.COVER;
		case 'contain':
			return ResizeMode.CONTAIN;
		default:
			return ResizeMode.STRETCH;
	}
};

export const getCountry = (countryCode?: string) =>
	getCountryList().find(({ code }) => code === countryCode);

export const getNationality = (countryCode?: string) => {
	const countryList = getCountryList();
	const country = countryList.find(({ code }) => code === countryCode);
	return i18nConfig.fallbackLng === getLang()
		? country?.nationality
		: country?.name;
};

export function sanitizeDate(date: string) {
	if (date.length === 4) {
		return new Date(`${date}-01-01`);
	}
	if (!Number.isNaN(Number(date))) {
		if (Number(date) < Date.now() / 1000) {
			return new Date(Number(date) * 1000);
		}
		return new Date(Number(date));
	}
	if (date.match(/^\d{2}[-|/]\d{2}[-|/]\d{4}$/)) {
		const dateParts = date.split(/-|\//);
		if (dateParts.length === 3) {
			return new Date(
				Number(dateParts[2]),
				Number(dateParts[1]),
				Number(dateParts[0])
			);
		}
	}
	return new Date(date);
}

export const getWebImageSize = (file: File) => {
	const img = new Image();
	img.src = window.URL.createObjectURL(file);
	const promise = new Promise<
		{ width: number; height: number } | null | undefined
	>((resolve, reject) => {
		img.onload = () => {
			const width = img.naturalWidth;
			const height = img.naturalHeight;
			resolve({ width, height });
		};
		img.onerror = reject;
	});
	return promise;
};

export const getStaticImage = (path: string) => {
	return `${__DEV__ ? 'http' : 'https'}://${
		process.env.NEXT_PUBLIC_WEBSITE_DOMAIN
	}/images/${path}`;
};

export type ProjectsFilterFunction = (projects: Project[]) => Project[];

export const sortProjectsByProgress = (
	{ percent: percent1, isPresale: isPresale1 }: Project,
	{ percent: percent2, isPresale: isPresale2 }: Project
) => {
	if (isPresale1 !== isPresale2) {
		return isPresale1 ? -1 : 1;
	}
	return percent1 > percent2 ? -1 : 1;
};

export const sortProjectsByAmountSold = (
	{ percent: percent1, targetPrice: targetPrice1 }: Project,
	{ percent: percent2, targetPrice: targetPrice2 }: Project
) => {
	return targetPrice1 * percent1 > targetPrice2 * percent2 ? -1 : 1;
};

export const isProjectCompleted = ({ percent }: Project) => percent >= 100;

export const isProjectOngoing = ({
	startOfCrowdfundingDate,
	endOfCrowdfundingDate,
	percent,
}: Project) =>
	Date.now() > new Date(startOfCrowdfundingDate).getTime() &&
	Date.now() < new Date(endOfCrowdfundingDate).getTime() &&
	percent < 100;

export const isProjectUpcoming = ({ startOfCrowdfundingDate }: Project) =>
	Date.now() < new Date(startOfCrowdfundingDate).getTime();

export const isExclusiveVIPProject = ({
	tags,
	startOfCrowdfundingDate,
	percent,
}: Project) => {
	const isVIPtest = tags?.find(
		(label) => label === 'test_vip_exclusivity_period'
	);
	if (isVIPtest) {
		return true;
	}
	const isVIP = tags?.find((label) => label === '48h_vip_exclusivity_period');
	if (!isVIP) {
		return false;
	}
	const fortyHeightHoursBeforeStart = new Date(startOfCrowdfundingDate);
	fortyHeightHoursBeforeStart.setDate(
		fortyHeightHoursBeforeStart.getDate() - 2
	);
	return (
		Date.now() > fortyHeightHoursBeforeStart.getTime() &&
		Date.now() < new Date(startOfCrowdfundingDate).getTime() &&
		percent < 100
	);
};

export const isProjectOngoingOrVip = (project) =>
	isProjectOngoing(project) || isExclusiveVIPProject(project);

export const projectsFilterFunctions: {
	[filterOption in ProjectsFilterOption]: ProjectsFilterFunction;
} = {
	all: (projects) => projects,
	complete: (projects) => projects.filter(isProjectCompleted),
	upcoming: (projects) => projects.filter(isProjectUpcoming),
	vip: (projects) => projects.filter(isExclusiveVIPProject),
	ongoing: (projects) => projects.filter(isProjectOngoing),
	ongoingOrVip: (projects) => projects.filter(isProjectOngoingOrVip),
};

export function partition<T>(array: T[], isValid: (element: T) => boolean) {
	return array.reduce(
		([pass, fail], elem) => {
			return isValid(elem)
				? [[...pass, elem], fail]
				: [pass, [...fail, elem]];
		},
		[[], []] as [T[], T[]]
	);
}

export const projectsGroupingFunctions = {
	vipAndNot: (projects) => partition(projects, isExclusiveVIPProject),
};

export function getAppVersion() {
	return `v${Constants?.expoConfig?.version ?? packageJson?.version}`;
}

export const getAxiosErrorMessage = (error) =>
	error.isAxiosError
		? error.response?.data?.error ??
		  error.message ??
		  error.ResultMessage ??
		  error.toString()
		: error.message;
