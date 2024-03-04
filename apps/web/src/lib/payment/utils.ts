import prisma, {
	Prisma,
	AddressWithCountry,
	LegalRepresentativeUser,
	UserWithWallets,
	SchemaTypes,
} from '../prismadb';
import Decimal from 'decimal.js';
import { getPaymentContextForUser, Mango, Mangopay } from './client';
import { Role } from '@prisma/client';
import crypto from 'crypto';
import {
	computeFees,
	difiedNumber,
	eurNumber,
} from '@diversifiedfinance/app/components/checkout/currency-utils';

// TODO: support other currencies?
//  From Mangopay docs:
//  > An amount of money in the smallest sub-division of the currency,
//  > e.g. 12.60 EUR would be represented as 1260 whereas 12 JPY would
//  > be represented as just 12)
export function decimalToMangopayMoney(decimal: Decimal.Value) {
	return new Decimal(decimal).mul(100).round().toNumber();
}

export function mangopayMoneyToDecimal(amountInCents: Decimal.Value) {
	const value = new Decimal(amountInCents);
	return value.dividedBy(100);
}

export function nameUUIDFromBytes(input: crypto.BinaryLike) {
	const md5Bytes = crypto.createHash('md5').update(input).digest();
	/* eslint-disable no-bitwise */
	md5Bytes[6] &= 0x0f; /* clear version        */
	md5Bytes[6] |= 0x30; /* set to version 3     */
	md5Bytes[8] &= 0x3f; /* clear variant        */
	md5Bytes[8] |= 0x80; /* set to IETF variant  */
	/* eslint-enable no-bitwise */
	return md5Bytes.toString('hex');
}

export const mangopayKYCtoDbKYCStatus = (mangoKYC: Mangopay.user.KYCLevel) => {
	if (mangoKYC === 'LIGHT') {
		return 'prechecked';
	}
	return 'completed';
};

export const dbAddressToMangopayAddress = (
	mangoClient: Mangopay,
	address?: AddressWithCountry
) => {
	if (!address) {
		throw new Error('Address is missing');
	}
	return new mangoClient.models.Address({
		AddressLine1: address.addressLine1,
		AddressLine2: address.addressLine2 ?? undefined,
		City: address.city,
		Region: address.region ?? undefined,
		PostalCode: address.postalCode,
		Country: fix_ISO3166_1_alpha_2_country_code(
			address.country.code
		) as Mangopay.CountryISO,
	});
};

export const dbAddressToOneLiner = (
	address?: AddressWithCountry,
	twoLines = false
) => {
	return `${address?.addressLine1 ?? ''}${
		address?.addressLine2 ? `, ${address.addressLine2}` : ''
	}${twoLines ? '\n' : ','} ${address?.postalCode ?? ''} ${
		address?.city ?? ''
	}${address?.country.code ? `, ${address.country.code}` : ''}`;
};

export const dbUserToMangopayUserLegal = (
	mangoClient: Mangopay,
	user: LegalRepresentativeUser,
	category: 'PAYER' | 'OWNER'
) => {
	if (!user) {
		throw new Error('User is undefined');
	}
	if (!user.email) {
		throw new Error('User email is missing');
	}
	if (!user.firstName) {
		throw new Error('User first name is missing');
	}
	if (!user.lastName) {
		throw new Error('User last name is missing');
	}
	if (!user.birthDate) {
		throw new Error('User birth date is missing');
	}
	if (!user.nationality) {
		throw new Error('User nationality is missing');
	}
	if (!user.countryOfResidence) {
		throw new Error('User country of residence is missing');
	}
	if (!user.company) {
		throw new Error('User is not a legal representative of a company');
	}
	if (!user.company.address) {
		throw new Error('Company is missing an address');
	}
	if (!user.company.email) {
		throw new Error('Company is missing an email');
	}
	if (!user.company.name) {
		throw new Error('Company is missing a name');
	}
	if (!user.company.type) {
		throw new Error('Company is missing a legal type');
	}
	return new mangoClient.models.UserLegal({
		Id: user.mangopayId ?? undefined,
		PersonType: 'LEGAL',
		LegalPersonType: user.company.type as any,
		UserCategory: category,
		Name: user.company.name,
		Email: user.company.email,
		CompanyNumber: user.company.number,
		LegalRepresentativeEmail: user.email,
		LegalRepresentativeFirstName: user.firstName,
		LegalRepresentativeLastName: user.lastName,
		LegalRepresentativeBirthday: Math.round(
			user.birthDate.getTime() / 1000
		),
		LegalRepresentativeNationality: user.nationality
			.code as Mangopay.CountryISO,
		LegalRepresentativeCountryOfResidence: user.countryOfResidence
			.code as Mangopay.CountryISO,
		Tag: 'Created from App',
		TermsAndConditionsAccepted: Boolean(user.termsAndConditionsAcceptedAt),
		LegalRepresentativeAddress: dbAddressToMangopayAddress(
			mangoClient,
			user.address ?? undefined
		),
		HeadquartersAddress: dbAddressToMangopayAddress(
			mangoClient,
			user.company.address
		),
	});
};

/*
 * OWNER
 * - mangopayWalletId: Diversified main OWNER Euro wallet
 *   => UNUSED
 * - mangopayCreditsWalletId: `Diversified free credits OWNER Euro wallet`
 *   => wallet storing free credits owned by users and referred by user.creditsEur
 *
 * PAYER
 * - mangopayWalletId: Diversified main PAYER Euro wallet
 *   => UNUSED
 *   => has banking alias 3501788654 (LU63805IKF0NUR5RK42Y MAGYLUL1XXX)
 * - mangopayCreditsWalletId: Diversified free credits PAYER Euro wallet
 *   => UNUSED
 *
 * SELLER (propco@diversified.fi)
 * - mangopayWalletId: System wallet clglado46000gfcfho2ywjjdo - OWNER for Vincent Bourdel
 *   => attached to OWNER mangopayUserId
 *   => Commonly referred internally as "the marketing wallet"
 *   => has banking alias 3532610514 (FR93219330000136USSWZUTG402 MPAYFRP1XXX)
 *   => Historically: stored marketing free credits owned by Diversified to be distributed to users
 *   => Now: receive exit funds from projects
 * - mangopayCreditsWalletId: NULL
 */
export async function getSystemUser(
	type: 'PAYER' | 'OWNER',
	{ useSandbox = false }: { useSandbox?: boolean } = {},
	tx?: Prisma.TransactionClient
): Promise<{
	id: string;
	mangopayId: string;
	mangopayWalletId?: string;
	mangopayCreditsWalletId?: string;
}> {
	const prismaClient = tx ?? prisma;
	const systemUser = await prismaClient.user.findFirstOrThrow({
		where: {
			email:
				type === 'PAYER'
					? 'mangopay+payer@diversified.fi'
					: 'mangopay+owner@diversified.fi',
			role: Role.ADMIN,
		},
		select: {
			id: true,
			mangopayId: true,
			mangopayWalletId: true,
			mangopayCreditsWalletId: true,
			...(useSandbox && {
				sandboxMangopayId: true,
				sandboxMangopayWalletId: true,
				sandboxMangopayCreditsWalletId: true,
			}),
		},
	});
	if (!useSandbox && !systemUser.mangopayId) {
		throw new Error(
			`System user ${type} misconfigured. Mangopay account missing`
		);
	}
	if (useSandbox && !systemUser.sandboxMangopayId) {
		throw new Error(
			`System user ${type} misconfigured on sandbox. Mangopay account missing`
		);
	}
	const mangopayId = useSandbox
		? systemUser.sandboxMangopayId
		: systemUser.mangopayId;
	const mangopayWalletId = useSandbox
		? systemUser.sandboxMangopayWalletId
		: systemUser.mangopayWalletId;
	const mangopayCreditsWalletId = useSandbox
		? systemUser.sandboxMangopayCreditsWalletId
		: systemUser.mangopayCreditsWalletId;
	return {
		id: systemUser.id,
		mangopayId: mangopayId!,
		mangopayWalletId: mangopayWalletId ?? undefined,
		mangopayCreditsWalletId: mangopayCreditsWalletId ?? undefined,
	};
}

function fix_ISO3166_1_alpha_2_country_code(code: string) {
	return code === 'UK' ? 'GB' : code;
}

export const dbUserToMangopayUserNatural = (
	mangoClient: Mangopay,
	user: UserWithWallets,
	settingsOverride?: any
) => {
	if (!user) {
		throw new Error('User is undefined');
	}
	if (!user.email) {
		throw new Error('User email is missing');
	}
	if (!user.firstName) {
		throw new Error('User first name is missing');
	}
	if (!user.lastName) {
		throw new Error('User last name is missing');
	}
	if (!user.termsAndConditionsAcceptedAt) {
		throw new Error('Terms and Conditions not accepted');
	}
	const { mangopayUserId } = getPaymentContextForUser(user, settingsOverride);
	return new mangoClient.models.UserNaturalPayer({
		Id: mangopayUserId ?? undefined,
		PersonType: 'NATURAL',
		Email: user.email,
		FirstName: user.firstName,
		LastName: user.lastName,
		UserCategory: 'PAYER', // OWNER are not allowed for our mangopay contract atm
		Capacity: 'NORMAL',
		Tag: 'Created from App',
		TermsAndConditionsAccepted: Boolean(user.termsAndConditionsAcceptedAt),
		Address: user.address
			? dbAddressToMangopayAddress(mangoClient, user.address)
			: undefined,
		...(user.birthDate && {
			Birthday: Math.round(user.birthDate.getTime() / 1000),
		}),
		...(user.nationality && {
			Nationality: fix_ISO3166_1_alpha_2_country_code(
				user.nationality.code
			) as Mangopay.CountryISO,
		}),
		...(user.countryOfResidence && {
			CountryOfResidence: fix_ISO3166_1_alpha_2_country_code(
				user.countryOfResidence.code
			) as Mangopay.CountryISO,
		}),
	});
};

export async function getSeller(
	email: string = 'propco@diversified.fi',
	{ useSandbox = false }: { useSandbox?: boolean } = {},
	tx?: Prisma.TransactionClient
) {
	const prismaClient = tx ?? prisma;
	const sellerUser = await prismaClient.user.findFirstOrThrow({
		where: {
			email,
			role: Role.SELLER,
		},
		select: {
			id: true,
			mangopayWalletId: true,
			...(useSandbox && { sandboxMangopayWalletId: true }),
		},
	});
	if (!useSandbox && !sellerUser.mangopayWalletId) {
		throw new Error(
			`Seller user ${email} misconfigured. Mangopay wallet missing`
		);
	}
	if (useSandbox && !sellerUser.sandboxMangopayWalletId) {
		throw new Error(
			`System user ${email} misconfigured on sandbox. Mangopay wallet missing`
		);
	}
	const mangopayWalletId = useSandbox
		? sellerUser.sandboxMangopayWalletId
		: sellerUser.mangopayWalletId;
	return {
		id: sellerUser.id,
		mangopayWalletId,
	};
}

/**
 * Get the net amount and fees amount from a gross amount
 * Eg. grossAmount = 100.00 EUR and feesPercent = 5%
 *  => netAmount = 95 EUR in tokens + 5 EUR in fees
 * 	=> feesAmount = 5 EUR
 * This function should not be used as the real fee is closer to 5.26%
 *
 * @param grossAmount
 * @param project
 * @param project.feesPercent
 */
export function getNetAmountAndFeesV1_deprecated(
	grossAmount: Decimal,
	project: { feesPercent: Decimal }
): { netAmount: Decimal; feesAmount: Decimal; net: number; fees: number } {
	const netAmount = new Decimal(
		grossAmount
			.mul(new Decimal(1).sub(project.feesPercent.div(100)))
			.toFixed(2)
	);
	const feesAmount = grossAmount.sub(netAmount);
	return {
		netAmount,
		feesAmount,
		fees: feesAmount.toNumber(),
		net: netAmount.toNumber(),
	};
}

/**
 * Get the net amount and fees amount from a gross amount
 * Eg. grossAmount = 105.00 EUR and feesPercent = 5%
 * 	=> netAmount = 100 EUR
 * 	=> feesAmount = 5 EUR
 *
 * @param grossAmount
 * @param project
 * @param project.feesPercent
 */
export function getNetAmountAndFeesV101(
	grossAmount: Decimal.Value,
	project: { feesPercent: Decimal.Value }
): { netAmount: Decimal; feesAmount: Decimal; net: number; fees: number } {
	const feesAmountEur = computeFees(
		grossAmount,
		Decimal.div(project.feesPercent, 100),
		true
	);
	const netAmountDecimal = Decimal.sub(grossAmount, feesAmountEur);
	const netAmountNumber = eurNumber(netAmountDecimal);
	const netAmountDecimalRounded = new Decimal(netAmountNumber);
	return {
		netAmount: netAmountDecimalRounded,
		feesAmount: new Decimal(feesAmountEur),
		fees: feesAmountEur,
		net: netAmountNumber,
	};
}

export function getGrossAmountDecimal(
	netAmount: Decimal,
	project: { feesPercent: Decimal }
): Decimal {
	const feesAmount = computeFees(
		netAmount,
		project.feesPercent.div(100),
		false
	);
	return netAmount.add(feesAmount);
}

export async function fetchAll(fetchFunction, params = {}) {
	const firstPageResponse = await fetchFunction({
		parameters: {
			...params,
			per_page: 100,
			Page: 1,
		},
		resolveWithFullResponse: true,
	});
	const numberOfPages = Number(
		firstPageResponse.headers['x-number-of-pages'] ?? 1
	);
	let results = firstPageResponse.body ?? [];
	let currentPage = 1;
	while (currentPage++ <= numberOfPages) {
		results = [
			...results,
			...(await fetchFunction({
				parameters: {
					...params,
					per_page: 100,
					Page: currentPage,
				},
			})),
		];
	}
	return results;
}

export function getDifiedValue(
	quantityInDecimal: BigInt | Decimal.Value,
	tokenDecimals: number = 3
): number {
	return difiedNumber(
		new Prisma.Decimal(
			typeof quantityInDecimal === 'bigint'
				? quantityInDecimal.toString()
				: quantityInDecimal
		).div(Math.pow(10, tokenDecimals))
	);
}

// export function eurToDified(
// 	eurAmount: Decimal.Value = 0,
// 	project: SchemaTypes.Project
// ): number {
// 	return Number(
// 		new Decimal(eurAmount)
// 			.dividedBy(project.tokenPrice)
// 			.toFixed(project.tokenDecimals)
// 	);
// }
