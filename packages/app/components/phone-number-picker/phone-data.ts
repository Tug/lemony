import { getCountryList } from '@diversifiedfinance/design-system/country-code-picker/country-code-data';

// From: https://magic.link/docs/auth/introduction/faq
// Some country codes are blocked due to heavy spam traffic from the region.
// If a user's country code is blocked they may still authenticate through email.
const blockedCountryCodesForSMS = [
	'+7',
	'+45',
	'+53',
	'+62',
	'+84',
	'+92',
	'+94',
	'+98',
	'+221',
	'+225',
	'+231',
	'+234',
	'+243',
	'+244',
	'+249',
	'+263',
	'+291',
	'+370',
	'+375',
	'+591',
	'+670',
	'+855',
	'+870',
	'+880',
	'+881',
	'+882',
	'+883',
	'+962',
	'+963',
	'+964',
	'+968',
	'+994',
	'+996',
];

const blockedCountryCodesForSMSMap: Record<string, boolean> =
	blockedCountryCodesForSMS.reduce((map, code) => {
		return {
			...map,
			[code]: true,
		};
	}, {} as Record<string, boolean>);

export default function getPhoneData(t) {
	return getCountryList(t).filter(
		({ dial_code }) => !blockedCountryCodesForSMSMap[dial_code]
	);
}
