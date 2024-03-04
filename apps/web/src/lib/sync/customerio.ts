// import { TrackClient, RegionEU, IdentifierType } from 'customerio-node';
import prisma, {
	orderForProjectIncludes,
	Prisma,
	projectWithProductIdsIncludes,
	SchemaTypes,
	UserWithReferrer,
	userWithReferrerIncludes,
	UserWithWallets,
	userWithWalletsIncludes,
} from '../prismadb';
import { difiedNumber } from '@diversifiedfinance/app/components/checkout/currency-utils';
import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import { getProjectPercent } from '../project/utils';
import { Project } from '@diversifiedfinance/types';
import { getWPMedia } from '../wordpress-rest-api';
import { trackV2 } from '@diversifiedfinance/app/lib/customerio/client.web';

function toCustomerIOProfile(user: UserWithWallets) {
	// const countryName = getCountry(user.address?.country?.code)?.name;
	return {
		externalId: user.id,
		email: user.email ?? undefined,
		phoneNumber: user.phoneNumber ?? undefined,
		firstName: user.firstName ?? undefined,
		lastName: user.lastName ?? undefined,
		...(user.address && {
			location: {
				address1: user.address.addressLine1,
				address2: user.address.addressLine2 ?? undefined,
				city: user.address.city,
				region: user.address.region ?? undefined,
				zip: user.address.postalCode,
				country: user.address?.country?.code,
			},
		}),
		birthDate: user.birthDate
			? Math.floor(user.birthDate.getTime() / 1000)
			: undefined,
		nationality: user.nationality ?? undefined,
		countryOfResidence: user.countryOfResidence ?? undefined,
		termsAndConditionsAccepted: Boolean(
			user.termsAndConditionsAcceptedAt && user.privacyPolicyAcceptedAt
		),
		disclaimerAccepted: Boolean(user.disclaimerAcceptedAt),
		emailVerified: Boolean(user.emailVerified),
		phoneNumberVerified: Boolean(user.phoneNumberVerified),
		image: user.image ?? undefined,
		createdAt: user.createdAt
			? Math.floor(user.createdAt.getTime() / 1000)
			: undefined,
		updatedAt: user.updatedAt
			? Math.floor(user.updatedAt.getTime() / 1000)
			: undefined,
		disabled: user.disabled,
		role: user.role,
		kycStatus: user.kycStatus ?? undefined,
		kycUpdatedAt: user.kycUpdatedAt
			? Math.floor(user.kycUpdatedAt.getTime() / 1000)
			: undefined,
		locale: user.locale ?? 'en',
		// For backward compat
		// TODO: remove next 2 lines
		name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
		verified: user.kycStatus === 'completed',
		has_onboarded: Boolean(
			user.firstName &&
				user.lastName &&
				user.birthDate &&
				user.nationality &&
				user.countryOfResidence
		),
		labels: (user.labels ?? []).map(({ label }) => label),
		referralCode: user.referralCode ?? undefined,
		referrerId: user.referrerId ?? undefined,
		notificationsLastOpened: user.notificationsLastOpened,
		xp: user.xp,
	};
}

export async function syncCustomerIOProfile(
	user: UserWithWallets & UserWithReferrer,
	extraTraits?: any
) {
	const newDateSynced = new Date();
	const userInfoForCio = toCustomerIOProfile(user);
	await trackV2({
		type: 'person',
		identifiers: { id: user.id },
		action: 'identify',
		attributes: {
			...userInfoForCio,
			sponsorId: user.referrerId ?? undefined,
			sponsorLabels: (user.referrer?.labels ?? []).map(
				({ label }) => label
			),
			sponsorReferralCode: user.referrer?.referralCode ?? undefined,
			leadSource: user.leadSource ?? undefined,
			...extraTraits,
		},
	});
	const orders = await prisma.order.findMany({
		where: {
			userId: user.id,
			type: 'BUY',
			status: { in: ['paid', 'prepaid', 'processed', 'preprocessed'] },
			...(user.customerioLastSyncedAt && {
				createdAt: {
					gte: user.customerioLastSyncedAt,
				},
			}),
		},
		include: orderForProjectIncludes,
	});
	if (orders.length > 0) {
		await trackV2(orders.map(orderToEvent));
	}
	const deviceTokens = await prisma.deviceToken.findMany({
		where: {
			userId: user.id,
			platform: { in: ['ios', 'android'] },
		},
	});
	for (const deviceToken of deviceTokens) {
		await trackV2({
			type: 'person',
			identifiers: {
				id: user.id,
			},
			action: 'add_device',
			device: {
				token: deviceToken.token,
				platform: deviceToken.platform,
				last_used: Math.round(deviceToken.updatedAt.getTime() / 1000),
				attributes: {
					push_enabled: 'true',
				},
			},
		});
	}
	await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			customerioLastSyncedAt: newDateSynced,
			updatedAt: newDateSynced,
		},
	});
}

export async function syncLastUpdatedProfiles({
	count = 300,
	verbose = false,
	force = false,
}: {
	count?: number;
	verbose?: boolean;
	force?: boolean;
} = {}) {
	// updated_at is updated when notificationsLastOpened is updated
	// TODO: determine if it's relevant to sync everytime users open the notifications tab
	const userIds = await prisma.$queryRaw`
		SELECT id FROM users
		WHERE ${force.toString()}
			OR "customerioLastSyncedAt" IS NULL
			OR "customerioLastSyncedAt" < updated_at - INTERVAL '1 second'
		LIMIT ${count}
	`;
	const users = await prisma.user.findMany({
		where: {
			id: {
				in: userIds.map(({ id }) => id),
			},
		},
		orderBy: [
			{
				disabled: 'desc',
			},
			{
				updatedAt: 'asc',
			},
		],
		include: {
			...userWithWalletsIncludes,
			...userWithReferrerIncludes,
			bankAccounts: {
				select: {
					id: true,
				},
			},
			tokenClaims: {
				select: {
					id: true,
				},
			},
		},
	});
	for (const user of users) {
		try {
			if (verbose) {
				console.log(
					'Syncing user',
					user.id,
					user.email ?? user.phoneNumber
				);
			}
			const hasBankingDetails = Boolean(user.bankAccounts.length > 0);
			const hasTokenClaim = Boolean(user.tokenClaims.length > 0);
			await syncCustomerIOProfile(user, {
				hasBankingDetails,
				hasTokenClaim,
			});
		} catch (err) {
			console.error(
				`Error syncing user ${user.id}:`,
				err?.response?.data ?? err
			);
		}
	}
	return users.length;
}

export async function deleteCustomerIOProfile(user: UserWithWallets) {
	const existingUser = await prisma.user.findFirst({
		where: {
			disabled: false,
			NOT: { id: user.id, klaviyoId: null },
			OR: [
				{ email: user.email, NOT: { emailVerified: null } },
				{
					phoneNumber: user.phoneNumber,
					NOT: { phoneNumberVerified: null },
				},
			],
		},
	});
	try {
		if (existingUser) {
			await trackV2({
				type: 'person',
				action: 'merge',
				primary: { id: user.id },
				secondary: { id: existingUser.id },
			});
		} else {
			// WARNING: suppressing a profile disable email communication for that email
			// even if we have multiple accounts with the same email
			// await cio.suppress(user.id);
			await trackV2({
				type: 'person',
				action: 'delete',
				identifiers: { id: user.id },
			});
		}
	} catch (err) {
		throw err;
	}
}

function orderToEvent(order: SchemaTypes.Order) {
	return {
		type: 'object',
		action: 'identify',
		identifiers: {
			object_type_id: '2',
			object_id: order.id,
		},
		attributes: {
			name: order.id,
			value: order.amount.toNumber(),
			time: order.createdAt,
			SKU: order.project.tokenSymbol,
			tokenName: order.project.tokenName,
			quantity: difiedNumber(
				new Prisma.Decimal(order.quantityInDecimal.toString()).div(
					Math.pow(10, order.project.tokenDecimals ?? 3)
				)
			),
			createdAt: order.createdAt
				? Math.floor(order.createdAt.getTime() / 1000)
				: undefined,
			updatedAt: order.updatedAt
				? Math.floor(order.updatedAt.getTime() / 1000)
				: undefined,
			projectId: order.projectId,
			amount: order.amount.toNumber(),
			currency: order.currency,
			paymentStatus: order.paymentStatus,
			paymentId: order.paymentId,
			status: order.status,
			fundsSource: order.fundsSource,
			type: order.type,
			executionType: order.executionType,
		},
		cio_relationships: [
			{
				identifiers: {
					id: order.userId,
				},
			},
		],
	};
}

async function getFirstProjectImageUrl(project?: Project) {
	const slideshowBlock = project?.content?.find(
		({ blockName }) => blockName === 'jetpack/slideshow'
	);
	const firstImageId = slideshowBlock?.attrs.ids[0];
	const mediaRes = await getWPMedia([Number(firstImageId)]);
	if (!mediaRes || mediaRes.length === 0) {
		return undefined;
	}
	return mediaRes[0].source_url;
}

async function toCustomerIOProject(project: SchemaTypes.Project): Promise<any> {
	return {
		type: 'object',
		action: 'identify',
		identifiers: {
			object_type_id: '1',
			object_id: project.id,
		},
		attributes: {
			name: project.title ?? project.tokenName,
			externalId: project.id,
			title: project.title ?? project.tokenName,
			price: project.tokenPrice.toNumber(),
			description: project.description ?? project.tokenSymbol,
			url: `https://${process.env.NEXT_PUBLIC_WEBSITE_DOMAIN}${getPath(
				'project',
				{ slug: project.slug }
			)}`,
			imageFullUrl: await getFirstProjectImageUrl(project),
			SKU: project.tokenSymbol,
			slug: project.slug,
			targetPrice: project.targetPrice.toNumber(),
			durationInMonths: project.durationInMonths,
			documentUrl: project.documentUrl,
			maxSupplyInDecimal: Number(project.maxSupplyInDecimal),
			tokenPrice: project.tokenPrice.toNumber(),
			crowdfundingStartsAt: project.crowdfundingStartsAt
				? Math.floor(project.crowdfundingStartsAt.getTime() / 1000)
				: undefined,
			crowdfundingEndsAt: project.crowdfundingEndsAt
				? Math.floor(project.crowdfundingEndsAt.getTime() / 1000)
				: undefined,
			percent: getProjectPercent(project),
			paid: project.paid,
			yearsForAPRCalculation: project.yearsForAPRCalculation,
			hasOwnPriceHistory: project.hasOwnPriceHistory,
			computedAPR: project.computedAPR?.toNumber(),
			updated: project.updatedAt
				? Math.floor(project.updatedAt.getTime() / 1000)
				: undefined,
			published: project.visibility === 'production',
		},
		cio_relationships: [
			{
				identifiers: {
					id: project.ownerId,
				},
			},
		],
	};
}

export async function syncCustomerIOProject(project: SchemaTypes.Project) {
	if (!project.ownerId) {
		console.log(`Skipping project ${project.id} because it has no owner`);
		return;
	}
	try {
		const projectForCio = await toCustomerIOProject(project);
		await trackV2(projectForCio);
	} catch (err) {
		console.error(err.response?.data);
		//throw err;
	}
}

export async function syncAllProjects() {
	const projects = await prisma.project.findMany({
		where: {
			visibility: 'production',
		},
		include: projectWithProductIdsIncludes,
	});
	for (const project of projects) {
		console.log('Syncing project', project.id, project.slug);
		await syncCustomerIOProject(project);
	}
}
