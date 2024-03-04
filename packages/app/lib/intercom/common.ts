import { Profile } from '@diversifiedfinance/types/diversified';
import type { UserAttributes } from '@intercom/intercom-react-native';

export const profileToIntercomUserData = (
	profileData: Profile
): UserAttributes => {
	return {
		userId: profileData.profile_id,
		email: profileData.emailVerified ? profileData.email : undefined,
		phone: profileData.phoneNumberVerified
			? profileData.phoneNumber
			: undefined,
		name: `${profileData.firstName} ${profileData.lastName}`.trim(),
		signedUpAt: new Date(profileData.createdAt).getTime() / 1000,
		customAttributes: {
			kycStatus: profileData.kycStatus ?? 'init',
			disclaimerAccepted: profileData.disclaimerAccepted,
			termsAccepted: profileData.termsAndConditionsAccepted,
		},
		languageOverride: profileData.locale ?? 'en',
		// unsubscribedFromEmails: true,
		// companies: [],=
	};
};

const camelToSnake = (str: string) =>
	str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const profileToIntercomUserDataWeb = (
	profileData: Profile
): UserAttributes =>
	Object.fromEntries(
		Object.entries(profileToIntercomUserData(profileData)).map(
			([key, value]) => [camelToSnake(key), value]
		)
	);
