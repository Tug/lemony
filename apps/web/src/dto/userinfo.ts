import { Prisma, UserWithWallets } from '../lib/prismadb';
import { WalletAddressesV2 } from '@diversifiedfinance/types';
import type {
	Address,
	MyInfo,
	Settings,
} from '@diversifiedfinance/types/diversified';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { getIntercomUserHash } from '../lib/intercom';
import { getLiveVIPLevelBenefits } from '../lib/vip';

export class UserInfoUpdateDTO {
	@IsOptional()
	firstName?: string;

	@IsOptional()
	lastName?: string;

	@IsOptional()
	birthDate?: string;

	@IsOptional()
	nationality?: string;

	@IsOptional()
	countryOfResidence?: string;

	@IsOptional()
	@Transform(({ value }) => (value ? value.trim().toLowerCase() : value))
	email?: string;

	@IsOptional()
	termsAndConditionsAccepted?: boolean;

	@IsOptional()
	disclaimerAccepted?: boolean;

	@IsOptional()
	leadSource?: string;

	@IsOptional()
	sponsorReferralCode?: string;

	@IsOptional()
	address?: Address & { country: string };

	@IsOptional()
	locale?: 'en' | 'fr';
}

export type UserInfoResponseDTO = MyInfo;

export const makeUserInfoResponse = (user: UserWithWallets): MyInfo => {
	const toWalletV2 = (wallet): WalletAddressesV2 => ({
		backendAddress: wallet.metadata?.publicAddress,
		address: wallet.address,
		ens_domain: undefined,
		nickname: undefined,
		email: wallet.metadata?.email,
		phone_number: wallet.metadata?.phoneNumber,
		is_email: Boolean(wallet.metadata?.is_email),
		is_phone: Boolean(wallet.metadata?.is_phone),
		is_apple: Boolean(wallet.metadata?.is_apple),
		is_google: Boolean(wallet.metadata?.is_google),
	});
	const wallets = user.wallets ?? [];
	const walletsV2 = wallets.map(toWalletV2);
	const primaryWallet = wallets.find((wallet) => wallet.isPrimary);
	const primaryWalletV2 = primaryWallet
		? toWalletV2(primaryWallet)
		: undefined;

	return {
		data: {
			profile: {
				profile_id: user.id,
				firstName: user.firstName ?? undefined,
				lastName: user.lastName ?? undefined,
				birthDate: user.birthDate?.toString(),
				nationality: user.nationality ?? undefined,
				countryOfResidence: user.countryOfResidence ?? undefined,
				address: user.address ?? undefined,
				termsAndConditionsAccepted: Boolean(
					user.termsAndConditionsAcceptedAt &&
						user.privacyPolicyAcceptedAt
				),
				disclaimerAccepted: Boolean(user.disclaimerAcceptedAt),
				email: user.email ?? undefined,
				phoneNumber: user.phoneNumber ?? undefined,
				emailVerified: Boolean(user.emailVerified),
				phoneNumberVerified: Boolean(user.phoneNumberVerified),
				image: user.image ?? undefined,
				createdAt: user.createdAt.toString(),
				updatedAt: user.updatedAt.toString(),
				disabled: user.disabled,
				role: user.role,
				kycStatus: user.kycStatus ?? undefined,
				kycUpdatedAt: user.kycUpdatedAt?.toString(),
				locale: user.locale ?? undefined,
				wallets,
				// For backward compat
				// TODO: remove next 2 lines
				name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
				username: `${user.firstName ?? ''} ${
					user.lastName ?? ''
				}`.trim(),
				wallet_addresses: wallets.map((wallet) => wallet.address),
				wallet_addresses_v2: walletsV2 ?? [],
				wallet_addresses_excluding_email_v2: walletsV2.filter(
					({ is_email }) => !is_email
				),
				primary_wallet: primaryWalletV2,
				verified: user.kycStatus === 'completed',
				has_onboarded: Boolean(
					user.firstName &&
						user.lastName &&
						user.birthDate &&
						user.nationality &&
						user.countryOfResidence
				),
				labels: user.labels?.map(({ label }) => label) ?? [],
				referralCode: user.referralCode ?? undefined,
				notificationsLastOpened: user.notificationsLastOpened,
				xp: user.xp,
				leadSource: user.leadSource ?? undefined,
				hasSponsor: Boolean(user.referrerId),
			},
			providers: {
				intercom: {
					userHash: getIntercomUserHash(user),
				},
			},
			settings: (user.settings ?? {}) as Settings,
			constants: {
				vipLevelBenefits: getLiveVIPLevelBenefits(),
			},
			overrides: {},
		},
	};
};

// Create a new function and pass the parameters onto the validator
export const validateUpdateUser = ({
	firstName,
	lastName,
	birthDate,
	nationality,
	countryOfResidence,
	disclaimerAccepted,
	termsAndConditionsAccepted,
	address,
	locale,
	leadSource,
}: Omit<UserInfoUpdateDTO, 'email'>) => {
	return Prisma.validator<Prisma.UserUpdateInput>()({
		...(firstName && { firstName }),
		...(lastName && { lastName }),
		...(disclaimerAccepted && { disclaimerAcceptedAt: new Date() }),
		...(termsAndConditionsAccepted && {
			termsAndConditionsAcceptedAt: new Date(),
			privacyPolicyAcceptedAt: new Date(),
		}),
		...(birthDate && { birthDate: new Date(birthDate) }),
		...(locale && {
			locale,
		}),
		...(leadSource && {
			leadSource,
		}),
		...(nationality && {
			nationality: {
				connect: {
					code: nationality,
				},
			},
		}),
		...(countryOfResidence && {
			countryOfResidence: {
				connect: {
					code: countryOfResidence,
				},
			},
		}),
		...(address && {
			address: {
				upsert: {
					create: {
						...address,
						country: {
							connect: {
								code: address.country?.code ?? address.country,
							},
						},
					},
					update: {
						...address,
						country: {
							connect: {
								code: address.country?.code ?? address.country,
							},
						},
					},
				},
			},
		}),
	});
};

export class UserInfoDeleteDTO {
	confirmed: boolean;
}

export class UserSettingsUpdateDTO implements Settings {
	@IsOptional()
	paymentSandbox?: boolean;

	@IsOptional()
	preferences: any;
}
