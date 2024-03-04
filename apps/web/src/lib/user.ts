import prisma, {
	Prisma,
	UserWithWallets,
	userWithWalletsIncludes,
	SchemaTypes,
	transactionWithRetry,
	legalRepresentativeIncludes,
} from './prismadb';
import type { Applicant } from '@sumsub/api-types';
import * as sumsub from './kyc-providers/sumsub';
import getCountryISO2 from './country-iso-3-to-2';
import type { KYCStatus } from '@diversifiedfinance/types/diversified';
import { CredentialsDTO } from '../dto/auth';
import { Role } from '@prisma/client';
import { sendEmailToUserWithTemplate } from './emails/sendgrid';
import { levelMinXPs } from '@diversifiedfinance/app/lib/vip';
import { LoginError } from './error';
import { getI18nServerInstance } from './i18n';

// Handles sign-up and sign-in in the same function
// This is alright for now as a user is considered signed up
// when all its info has been provided (See isProfileIncomplete)
// This allows users to resume onboarding at a later time
export const upsertUserFromWallet = async (
	walletInfo: { address: string },
	// TODO NEXT: add security check, make sure any updates to the user
	//  entity is sanitized (we don't want { role: 'ADMIN' } here)
	userData: {
		email?: string;
		phoneNumber?: string;
	} = {},
	accountData?: {
		provider: string;
		providerAccountId: string;
		providerMetadata?: any;
	},
	extraData?: {
		credentials?: CredentialsDTO;
	}
): Promise<{
	user: UserWithWallets;
	isNew: boolean;
}> => {
	const isDiversifiedAccount = Boolean(
		userData.email && userData.email.endsWith('@diversified.fi')
	);
	const defaultSettings = {
		...(isDiversifiedAccount && { paymentSandbox: true }),
	};
	const {
		userId,
		isNew,
	}: {
		userId: string;
		isNew: boolean;
	} = await transactionWithRetry(async (tx) => {
		let isNew = false,
			user: SchemaTypes.User | null;
		const validatedUserData =
			Prisma.validator<Prisma.UserUpdateInput>()(userData);
		const metadata = {
			...userData,
			is_email: Boolean(userData.email),
			is_phone: Boolean(userData.phoneNumber),
			is_apple: accountData?.providerMetadata?.oauthProvider === 'apple',
			is_google:
				accountData?.providerMetadata?.oauthProvider === 'google',
		};
		// check if there is an existing wallet for this address
		// otherwise create it
		const wallet = await tx.wallet.upsert({
			where: walletInfo,
			update: {
				isPrimary: true,
				metadata,
			},
			create: {
				isPrimary: true,
				metadata,
				...walletInfo,
			},
			include: {
				owner: true,
			},
		});

		user = wallet.owner;
		// if wallet has no owner, create it, or link it to existing user
		// using userData information.
		// The latter MUST be verified (proof of ownership)
		if (!user) {
			const userMatch = await hasExistingAccount(
				validatedUserData,
				undefined,
				tx
			);
			isNew = Boolean(!userMatch);
			if (userMatch) {
				user = await updateUserData(
					userMatch,
					validatedUserData,
					wallet,
					tx
				);
			} else {
				user = await tx.user.create({
					data: {
						...validatedUserData,
						emailVerified: Boolean(validatedUserData.email)
							? new Date()
							: undefined,
						phoneNumberVerified: Boolean(
							validatedUserData.phoneNumber
						)
							? new Date()
							: undefined,
						wallets: {
							connect: [{ id: wallet.id }],
						},
						settings: defaultSettings,
					},
				});
			}
		}
		// if wallet already has an owner, update it using userData
		// but check first if there is an existing user that already has this (verified) userData
		else if (Object.keys(validatedUserData).length > 0) {
			const isDuplicate = Boolean(
				await hasExistingAccount(
					{ id: user.id, ...validatedUserData },
					{ id: true },
					tx
				)
			);
			if (isDuplicate) {
				// TODO NEXT: implement user merging here
				// for now, just return the new user found without the updated userData
			} else {
				// otherwise just update it
				user = await updateUserData(
					user,
					validatedUserData,
					undefined,
					tx
				);
			}
		}

		// make all other wallets secondary
		await tx.wallet.updateMany({
			where: {
				ownerId: user.id,
				id: { not: wallet.id },
				isPrimary: true,
			},
			data: {
				isPrimary: false,
			},
		});

		return {
			userId: user.id,
			isNew,
		};
	});

	// save Magic account data (unused at the moment)
	if (accountData) {
		await prisma.account.upsert({
			where: {
				provider_providerAccountId: {
					provider: accountData.provider,
					providerAccountId: accountData.providerAccountId,
				},
			},
			// empty update is not a bug, this is how you do insert if not exist in prisma
			update: {},
			create: {
				provider: accountData.provider,
				providerAccountId: accountData.providerAccountId,
				userId,
				type: 'DID',
			},
		});
	}

	const userWithWallets = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		include: userWithWalletsIncludes,
	});

	checkUserEnabled(userWithWallets);

	// Cannot fire and forget on default serverless functions
	// https://vercel.com/docs/concepts/limits/overview#streaming-responses
	await postCreateUser({
		user: userWithWallets,
		isNew,
		extraData,
	});

	return {
		user: userWithWallets,
		isNew,
	};
};

export const upsertUser = async (
	// credentials must be verified before calling this function
	credentials: CredentialsDTO
): Promise<{
	user: UserWithWallets;
	isNew: boolean;
}> => {
	let user: UserWithWallets | null;
	const validatedUserData = Prisma.validator<Prisma.UserUpdateInput>()({
		email: credentials.email,
		phoneNumber: credentials.phoneNumber,
	});
	// check if there is an existing user for this verified email or phone number
	const userMatch = await hasExistingAccount(validatedUserData);
	const isNew = Boolean(!userMatch);
	if (userMatch) {
		user = await prisma.user.update({
			where: { id: userMatch.id },
			data: {
				...(validatedUserData.email && {
					email: validatedUserData.email,
					emailVerified: new Date(),
				}),
				...(validatedUserData.phoneNumber && {
					phoneNumber: validatedUserData.phoneNumber,
					phoneNumberVerified: new Date(),
				}),
			},
			include: userWithWalletsIncludes,
		});
	} else {
		const isDiversifiedAccount = Boolean(
			credentials.email && credentials.email.endsWith('@diversified.fi')
		);
		const defaultSettings = {
			...(isDiversifiedAccount && { paymentSandbox: true }),
		};
		user = await prisma.user.create({
			data: {
				...validatedUserData,
				emailVerified: Boolean(validatedUserData.email)
					? new Date()
					: undefined,
				phoneNumberVerified: Boolean(validatedUserData.phoneNumber)
					? new Date()
					: undefined,
				settings: defaultSettings,
			},
			include: userWithWalletsIncludes,
		});
	}

	await checkUserEnabled(user);

	// Cannot fire and forget on default serverless functions
	// https://vercel.com/docs/concepts/limits/overview#streaming-responses
	await postCreateUser({
		user,
		isNew,
	});

	return {
		user,
		isNew,
	};
};

async function checkUserEnabled(user: UserWithWallets) {
	if (user.disabled) {
		const i18n = await getI18nServerInstance(user.locale ?? undefined);
		throw new LoginError(
			i18n.t('User account is pending deletion.'),
			'ACCOUNT_PENDING_DELETION'
		);
	}
}

export async function postCreateUser({
	user,
	isNew,
	extraData,
}: {
	user: UserWithWallets;
	isNew: boolean;
	extraData?: {
		credentials?: CredentialsDTO;
	};
}) {
	if (!isNew) {
		return;
	}
	const asyncTasks = [
		// syncUser,
		ensureSumsubApplication,
		// sendWelcomeEmail, // this is moved to POST /api/userinfo when termsAndConditionsAcceptedAt is set to true
		async () => {
			const referralCode = extraData?.credentials?.activationCode;
			if (!referralCode) {
				return;
			}
			return applyReferralCode(user, referralCode);
		},
		generateUsersOwnReferralCode,
	];

	// run async tasks sequentially to prevent race conditions
	for (const task of asyncTasks) {
		try {
			await task(user);
		} catch (err) {
			// ignore errors at the moment
		}
	}

	// const results = await Promise.allSettled(
	// 	asyncTasks.map((task) => task(user))
	// );

	// const hasRejected = <T extends unknown>(
	// 	v: PromiseSettledResult<T>
	// ): v is PromiseRejectedResult => v.status === 'rejected';
	//
	// results.forEach((result) => {
	// 	if (hasRejected(result)) {
	// 		Sentry.captureException(result.reason);
	// 	}
	// });
}

export async function sendWelcomeEmail(user: SchemaTypes.User) {
	await sendEmailToUserWithTemplate({
		template: 'WELCOME',
		user,
	});
}

export async function updateUserData(
	user: SchemaTypes.User,
	validatedUserData: { email?: string; phoneNumber?: string },
	wallet?: SchemaTypes.Wallet,
	transaction?: any
): Promise<SchemaTypes.User> {
	const shouldUpdateEmail = Boolean(
		validatedUserData.email &&
			(!user.email ||
				(!user.emailVerified && validatedUserData.email === user.email))
	);
	const shouldUpdatePhoneNumber = Boolean(
		validatedUserData.phoneNumber &&
			(!user.phoneNumber ||
				(!user.phoneNumberVerified &&
					validatedUserData.phoneNumber === user.phoneNumber))
	);
	const userUpdated = await (transaction ?? prisma).user.update({
		where: { id: user.id },
		data: {
			...(shouldUpdateEmail && {
				email: validatedUserData.email,
				emailVerified: new Date(),
			}),
			...(shouldUpdatePhoneNumber && {
				phoneNumber: validatedUserData.phoneNumber,
				phoneNumberVerified: new Date(),
			}),
			...(wallet &&
				!wallet.ownerId && {
					wallets: {
						connect: [{ id: wallet.id }],
					},
				}),
		},
	});
	return userUpdated;
}

export async function hasExistingAccount(
	{
		id,
		email,
		phoneNumber,
	}: { id?: string; email?: string; phoneNumber?: string },
	select?: any,
	transaction?: any
): Promise<SchemaTypes.User | null> {
	if (!email && !phoneNumber) {
		return null;
	}
	const where: { NOT?: object; OR: object[] } = { OR: [] };
	if (email) {
		where.OR.push({
			email,
			NOT: { emailVerified: null },
		});
	}
	if (phoneNumber) {
		where.OR.push({
			phoneNumber,
			NOT: { phoneNumberVerified: null },
		});
	}
	if (id) {
		where.NOT = { id };
	}
	// test if another user already has the same (verified) email of phone number
	return await (transaction ?? prisma).user.findFirst({
		where,
		select,
	});
}

function getFullKYCStatus(applicant: Applicant): KYCStatus {
	let kycStatus: KYCStatus = applicant.review.reviewStatus;
	if (kycStatus === 'completed') {
		kycStatus =
			applicant.review.reviewResult?.reviewAnswer === 'RED'
				? 'failed'
				: 'completed';
	}
	return kycStatus;
}

export async function ensureSumsubApplication(user: UserWithWallets) {
	if (user.sumsubId) {
		if (user.kycStatus === 'completed') {
			return;
		}
		const applicant = await sumsub.getApplicant(user.sumsubId);
		const kycStatus = getFullKYCStatus(applicant);
		if (user.kycStatus !== kycStatus) {
			const kycUpdatedAt = new Date();
			await prisma.user.update({
				where: { id: user.id },
				data: {
					kycUpdatedAt,
					kycStatus,
				},
			});
			user.kycUpdatedAt = kycUpdatedAt;
			user.kycStatus = kycStatus;
		}
		return;
	}

	// make sure there is no existing applicant in sumsub for this user id
	// this could happen if the original user sync did not fully run
	const existingApplicant = await sumsub.getApplicantWithExternalUserId(
		user.id
	);

	if (existingApplicant) {
		await prisma.user.update({
			where: { id: user.id },
			data: {
				sumsubId: existingApplicant.id,
			},
		});
		user.sumsubId = existingApplicant.id;
		return;
	}

	const newApplicant = await sumsub.createApplicant({
		externalUserId: user.id,
		email: (user.emailVerified && user.email) || undefined,
		phone: (user.phoneNumberVerified && user.phoneNumber) || undefined,
		lang: user.locale ?? undefined,
	});

	if (!newApplicant) {
		throw new Error('Failed creating applicant on sumsub');
	}

	await prisma.user.update({
		where: { id: user.id },
		data: {
			sumsubId: newApplicant.id,
		},
	});

	user.sumsubId = newApplicant.id;
}

export async function syncApplicantDataWithUser(
	user: UserWithWallets,
	forceUpdate: boolean = false
) {
	await ensureSumsubApplication(user);
	if (!forceUpdate && user.kycStatus === 'completed') {
		return;
	}
	const applicant = await sumsub.getApplicant(user.sumsubId!);
	const kycStatus = getFullKYCStatus(applicant);
	if (kycStatus !== 'completed') {
		return;
	}
	const applicantInfo = {
		...applicant.info,
		...applicant.fixedInfo,
	};
	const nationality = applicantInfo.nationality ?? applicantInfo.country;
	const country = applicantInfo.country;
	const nationalityCode = nationality
		? getCountryISO2(nationality)
		: undefined;
	const countryCode = country ? getCountryISO2(country) : undefined;
	const updatedUserData = {
		...(user.kycStatus !== kycStatus && {
			kycStatus,
		}),
		...(!user.email &&
			applicant.email && {
				email: applicant.email,
				emailVerified: null,
			}),
		...(!user.firstName &&
			applicantInfo.firstName && {
				firstName: applicantInfo.firstName,
			}),
		...(!user.lastName &&
			applicantInfo.lastName && {
				lastName: applicantInfo.lastName,
			}),
		...(!user.birthDate &&
			applicantInfo.dob && {
				birthDate: new Date(applicantInfo.dob),
			}),
		...(!user.nationality &&
			nationalityCode && {
				nationality: {
					connect: { code: nationalityCode },
				},
			}),
		...(!user.countryOfResidence &&
			countryCode && {
				countryOfResidence: {
					connect: { code: countryCode },
				},
			}),
		...(!user.locale &&
			applicant.lang && {
				locale: applicant.lang,
			}),
	};

	if (Object.keys(updatedUserData).length > 0) {
		await prisma.user.update({
			where: { id: user.id },
			data: {
				kycUpdatedAt: new Date(),
				...updatedUserData,
			},
		});
	}
}

export async function addUserLabel(
	user: Pick<SchemaTypes.User, 'id'>,
	label: string,
	tx: Prisma.TransactionClient = prisma
) {
	return await tx.userLabel.upsert({
		where: {
			userId_label: {
				userId: user.id,
				label,
			},
		},
		update: {},
		create: {
			userId: user.id,
			label,
		},
	});
}

export async function applyReferralCode(
	user: Pick<SchemaTypes.User, 'id' | 'referrerId'>,
	activationCode: string
) {
	if (user.referrerId) {
		throw new Error('User already has a referrer');
	}
	const referrer = await prisma.user.findUniqueOrThrow({
		where: { referralCode: activationCode },
		select: { id: true },
	});
	if (referrer.id === user.id) {
		throw new Error('Cannot use your own referral code');
	}
	await prisma.user.update({
		where: { id: user.id },
		data: {
			referrerId: referrer.id,
			leadSource: 'referral',
		},
	});
	user.referrerId = referrer.id;
	user.leadSource = 'referral';
}

export async function getSellerUser(email: string = 'propco@diversified.fi') {
	return await prisma.user.findFirstOrThrow({
		where: {
			email,
			NOT: { emailVerified: null },
			role: Role.SELLER,
		},
		include: legalRepresentativeIncludes,
	});
}

export async function getSellerUserForProject(projectId: string) {
	return await prisma.user.findFirstOrThrow({
		where: {
			sellerProjects: {
				some: {
					id: projectId,
				},
			},
			role: Role.SELLER,
		},
		include: legalRepresentativeIncludes,
	});
}

function generateReferralCode(length = 8) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		// eslint-disable-next-line no-restricted-syntax
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters.charAt(randomIndex);
	}
	return result;
}

export async function generateUsersOwnReferralCode(user: UserWithWallets) {
	if (user.referralCode) {
		return;
	}
	let tries = 5;
	while (tries-- > 0) {
		const referralCode = generateReferralCode();
		try {
			await prisma.user.update({
				where: { id: user.id },
				data: {
					referralCode,
				},
			});
			user.referralCode = referralCode;
			return;
		} catch (err) {
			// retrying
		}
	}
}

export async function getAnonymizedName(
	userId: string,
	{
		lastNameInitial = true,
		companyName = false,
	}: { lastNameInitial?: boolean; companyName?: boolean } = {}
) {
	if (!userId) {
		return '';
	}
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId,
		},
		select: {
			firstName: true,
			lastName: lastNameInitial,
			...(companyName && {
				company: {
					select: {
						name: true,
					},
				},
			}),
		},
	});
	if (companyName && user.company?.name) {
		return user?.company?.name;
	}
	// TODO: beware content not sanitized
	let name = user.firstName;
	if (lastNameInitial) {
		const lastName = (user.lastName ?? '').split(' ').pop();
		name = `${user.firstName ?? ''} ${lastName.substring(0, 1)}.`;
	}
	return name.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
}

export async function setInitialUserXP(user: SchemaTypes.User) {
	let xp = 0;
	const tokenAmountRes = await prisma.$queryRaw`
		SELECT
			SUM(o."quantityInDecimal" / POWER(10, p."tokenDecimals")) as quantity
		FROM orders o
		JOIN projects p ON o."projectId" = p.id
		WHERE o.status IN ('paid', 'prepaid', 'processed', 'preprocessed') AND "userId" = ${user.id}
	`;
	if (tokenAmountRes?.[0]?.quantity) {
		xp += Number(tokenAmountRes?.[0]?.quantity) * 100;
	}
	const sponsoredCountRes = await prisma.$queryRaw`
		SELECT
			COUNT(*) as count
		FROM users u
		LEFT JOIN userlabels ul ON ul."userId" = u.id
		WHERE ul."label" = 'customer' AND "referrerId" = ${user.id}
	`;
	if (sponsoredCountRes?.[0]?.count) {
		xp += Number(sponsoredCountRes?.[0]?.count) * 1000;
	}
	await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			xp: Math.ceil(xp),
		},
	});
	await checkUserXPBenefits({ id: user.id, xp: Math.ceil(xp) });
}

export async function addUserXP(
	user: Pick<SchemaTypes.User, 'id'>,
	xp: number,
	tx: Prisma.TransactionClient = prisma
) {
	if (xp === 0) {
		return;
	}
	const userUpdated = await tx.user.update({
		where: {
			id: user.id,
		},
		data: {
			xp: {
				increment: Math.ceil(xp),
			},
		},
		select: {
			id: true,
			xp: true,
		},
	});
	await checkUserXPBenefits(userUpdated, tx);
}

export async function checkUserXPBenefits(
	user: Pick<SchemaTypes.User, 'id' | 'xp'>,
	tx?: Prisma.TransactionClient
) {
	const vipMinLevels = Object.entries(levelMinXPs)
		.filter(([label, minXP]) => label !== 'regular' && label !== 'user')
		.sort(([labelA, minXPA], [labelB, minXPB]) => {
			return minXPA - minXPB;
		})
		.reverse();
	for (const [label, minXp] of vipMinLevels) {
		if (user.xp >= minXp) {
			await addUserLabel(user, label, tx);
			break;
		}
	}
}
