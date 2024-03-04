import {
	CatalogItemCreateQuery,
	CatalogItemCreateQueryResourceObjectAttributes,
	CatalogItemEnum,
	Catalogs,
	EventCreateQueryV2,
	EventEnum,
	Events,
	GlobalApiKeySettings,
	MetricEnum,
	ProfileCreateQuery,
	ProfileEnum,
	Profiles,
} from 'klaviyo-api';
import prisma, {
	Prisma,
	projectWithProductIdsIncludes,
	SchemaTypes,
	UserWithWallets,
	userWithWalletsIncludes,
} from '../prismadb';
import getPath from '@diversifiedfinance/app/navigation/lib/get-path';
import { Project } from '@diversifiedfinance/types';
import { getWPMedia } from '../wordpress-rest-api';
import { getProjectPercent } from '../project/utils';
import { difiedNumber } from '@diversifiedfinance/app/components/checkout/currency-utils';
import IntegrationTypeEnum = CatalogItemCreateQueryResourceObjectAttributes.IntegrationTypeEnum;

new GlobalApiKeySettings(process.env.KLAVIYO_API_KEY);

function toKlaviyoProfile(user: UserWithWallets): ProfileCreateQuery {
	// const countryName = getCountry(user.address?.country?.code)?.name;
	const locale = user.settings?.preferences?.locale ?? user.locale ?? 'en';
	return {
		data: {
			type: ProfileEnum.Profile,
			attributes: {
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
				properties: {
					birthDate: user.birthDate,
					nationality: user.nationality ?? undefined,
					countryOfResidence:
						user.countryOfResidence?.code ?? undefined,
					termsAndConditionsAccepted: Boolean(
						user.termsAndConditionsAcceptedAt &&
							user.privacyPolicyAcceptedAt
					),
					disclaimerAccepted: Boolean(user.disclaimerAcceptedAt),
					emailVerified: Boolean(user.emailVerified),
					phoneNumberVerified: Boolean(user.phoneNumberVerified),
					image: user.image ?? undefined,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
					disabled: user.disabled,
					role: user.role,
					kycStatus: user.kycStatus ?? undefined,
					kycUpdatedAt: user.kycUpdatedAt,
					locale,
					// For backward compat
					// TODO: remove next 2 lines
					name: `${user.firstName ?? ''} ${
						user.lastName ?? ''
					}`.trim(),
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
				},
			},
		},
	};
}

export async function syncKlaviyoProfile(user: UserWithWallets) {
	const userInfoForKlaviyo = toKlaviyoProfile(user);
	if (!user.klaviyoId) {
		if (user.disabled) {
			return;
		}
		let klaviyoId;
		try {
			const profileResponse = await Profiles.createProfile(
				userInfoForKlaviyo
			);
			klaviyoId = profileResponse.body.data.id;
		} catch (err) {
			if (err.response?.status === 409) {
				// code = duplicate_profile
				klaviyoId =
					err.response.data?.errors?.[0]?.meta.duplicate_profile_id;
			}
			if (!klaviyoId) {
				if (err.code === 'ERR_BAD_REQUEST') {
					throw new Error(
						err.message +
							'\n' +
							JSON.stringify(err.response.data?.errors)
					);
				}
				throw err;
			}
		}
		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				klaviyoId,
				klaviyoLastSyncedAt: new Date(),
			},
		});
		user.klaviyoId = klaviyoId;
	} else {
		if (user.disabled) {
			await deleteKlaviyoProfile(user);
			return;
		}
		try {
			await Profiles.updateProfile(user.klaviyoId, {
				...userInfoForKlaviyo,
				data: {
					...userInfoForKlaviyo.data,
					id: user.klaviyoId,
				},
			});
		} catch (err) {
			if (err.response?.status === 409) {
				// console.log(
				// 	'user',
				// 	{
				// 		id: user.id,
				// 		email: user.email,
				// 		phoneNumber: user.phoneNumber,
				// 		klaviyoId: user.klaviyoId,
				// 		klaviyoLastSyncedAt: user.klaviyoLastSyncedAt,
				// 	},
				// 	{
				// 		...userInfoForKlaviyo,
				// 		data: {
				// 			...userInfoForKlaviyo.data,
				// 			id: user.klaviyoId,
				// 		},
				// 	}
				// );
				try {
					const existingUser = await prisma.user.findFirst({
						where: {
							NOT: { id: user.id, klaviyoId: null },
							OR: [
								{ email: user.email, emailVerified: null },
								{
									phoneNumber: user.phoneNumber,
									phoneNumberVerified: null,
								},
							],
						},
					});
					if (existingUser) {
						const existingUserInfoForKlaviyo =
							toKlaviyoProfile(existingUser);
						await Profiles.updateProfile(existingUser.klaviyoId, {
							...existingUserInfoForKlaviyo,
							data: {
								...existingUserInfoForKlaviyo.data,
								id: existingUser.klaviyoId,
								attributes: {
									...existingUserInfoForKlaviyo.data
										.attributes,
									email: existingUser.emailVerified
										? user.email
										: undefined,
									phoneNumber:
										existingUser.phoneNumberVerified
											? user.phoneNumber
											: undefined,
								},
							},
						});
					}
					await Profiles.updateProfile(user.klaviyoId, {
						...userInfoForKlaviyo,
						data: {
							...userInfoForKlaviyo.data,
							id: user.klaviyoId,
							attributes: {
								...userInfoForKlaviyo.data.attributes,
								email: user.emailVerified
									? user.email
									: undefined,
								phoneNumber: user.phoneNumberVerified
									? user.phoneNumber
									: undefined,
							},
						},
					});
				} catch (error) {
					throw new Error(
						error.response?.data?.errors?.[0].detail ??
							error.toString()
					);
				}
			}
			throw new Error(
				err.response?.data?.errors?.[0].detail ?? err.toString()
			);
		}
		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				klaviyoLastSyncedAt: new Date(),
				updatedAt: user.updatedAt,
			},
		});
	}
}

export async function syncLastUpdatedProfiles({
	count = 100,
	verbose = false,
	force = false,
}: {
	count?: number;
	verbose?: boolean;
	force?: boolean;
} = {}) {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	// updated_at is updated when notificationsLastOpened is updated
	// TODO: determine if it's relevant to sync everytime users open the notifications tab
	const userIds = await prisma.$queryRaw`
		SELECT id FROM users
		WHERE (${force.toString()} OR "klaviyoLastSyncedAt" IS NULL OR "klaviyoLastSyncedAt" < updated_at - INTERVAL '1 second')
			AND (disabled = false OR "klaviyoId" IS NOT NULL AND disabled = true)
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
		include: userWithWalletsIncludes,
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
			await syncKlaviyoProfile(user);
		} catch (err) {
			console.error(err);
		}
	}
	return users.length;
}

export async function deleteKlaviyoProfile(user: UserWithWallets) {
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
			if (existingUser.klaviyoId !== user.klaviyoId) {
				await Profiles.mergeProfiles({
					data: {
						type: 'profile-merge',
						id: existingUser.klaviyoId,
						relationships: {
							profiles: {
								data: [{ type: 'profile', id: user.klaviyoId }],
							},
						},
					},
				});
			}
		} else {
			// WARNING: supressing a profile disable email communication for that email
			// even if we have multiple accounts with the same email
			await Profiles.suppressProfiles({
				data: {
					type: 'profile-suppression-bulk-create-job',
					attributes: {
						profiles: {
							data: [
								{
									type: 'profile',
									attributes: {
										email: user.email,
									},
								},
							],
						},
					},
				},
			});
		}
	} catch (err) {
		throw new Error(
			err.response?.data?.errors?.[0].detail ?? err.toString()
		);
	}
	await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			klaviyoId: null,
		},
	});
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

async function toKlaviyoCatalogItem(
	project: SchemaTypes.Project
): Promise<CatalogItemCreateQuery> {
	return {
		data: {
			type: CatalogItemEnum.CatalogItem,
			attributes: {
				externalId: project.id,
				integrationType: IntegrationTypeEnum.Custom,
				title: project.title ?? project.tokenName,
				price: project.tokenPrice.toNumber(),
				catalogType: '$default',
				description: project.description ?? project.tokenSymbol,
				url: `https://${
					process.env.NEXT_PUBLIC_WEBSITE_DOMAIN
				}${getPath('project', { slug: project.slug })}`,
				imageFullUrl: await getFirstProjectImageUrl(project),
				// imageThumbnailUrl: 'https://via.placeholder.com/150',
				customMetadata: {
					SKU: project.tokenSymbol,
					slug: project.slug,
					targetPrice: project.targetPrice.toNumber(),
					durationInMonths: project.durationInMonths,
					documentUrl: project.documentUrl,
					maxSupplyInDecimal: Number(project.maxSupplyInDecimal),
					tokenPrice: project.tokenPrice.toNumber(),
					crowdfundingStartsAt:
						project.crowdfundingStartsAt.toISOString(),
					crowdfundingEndsAt:
						project.crowdfundingEndsAt.toISOString(),
					percent: getProjectPercent(project),
					paid: project.paid,
					yearsForAPRCalculation: project.yearsForAPRCalculation,
					hasOwnPriceHistory: project.hasOwnPriceHistory,
					computedAPR: project.computedAPR?.toNumber(),
					updated: project.updatedAt.toISOString(),
				},
				published: project.visibility === 'production',
			},
			// relationships: {
			// 	categories: {
			// 		data: [
			// 			{
			// 				type: 'catalog-category',
			// 				id: '$custom:::$default:::SAMPLE-DATA-CATEGORY-APPAREL',
			// 			},
			// 		],
			// 	},
			// },
		},
	};
}

export async function syncKlaviyoCatalogItem(project: SchemaTypes.Project) {
	const projectForKlaviyo = await toKlaviyoCatalogItem(project);
	try {
		await Catalogs.createCatalogItem(projectForKlaviyo);
	} catch (err) {
		if (err.response?.status === 409) {
			// code = duplicate_profile
			await Catalogs.updateCatalogItem(
				`$custom:::$default:::${project.id}`,
				{
					...projectForKlaviyo,
					data: {
						...projectForKlaviyo.data,
						id: `$custom:::$default:::${project.id}`,
					},
				}
			);
			return;
		}
		console.error(err.response.data.errors?.[0]);
		throw err;
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
		await syncKlaviyoCatalogItem(project);
	}
}

function toKlaviyoEvent(order: SchemaTypes.Order): EventCreateQueryV2 {
	return {
		data: {
			type: EventEnum.Event,
			attributes: {
				uniqueId: order.id,
				value: order.amount.toNumber(),
				time: order.createdAt,
				properties: {
					name: order.project.tokenName,
					SKU: order.project.tokenSymbol,
					ProductID: order.project.id,
					Quantity: difiedNumber(
						new Prisma.Decimal(
							order.quantityInDecimal.toString()
						).div(Math.pow(10, order.project.tokenDecimals ?? 3))
					),
					createdAt: order.createdAt.toISOString(),
					updatedAt: order.updatedAt.toISOString(),
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
				metric: {
					data: {
						type: MetricEnum.Metric,
						attributes: { name: 'Ordered Product' },
					},
				},
				profile: {
					data: {
						type: ProfileEnum.Profile,
						id: order.user.klaviyoId,
						attributes: {},
					},
				},
			},
		},
	};
}

async function syncKlaviyoOrderedProduct(order: SchemaTypes.Order) {
	const event = toKlaviyoEvent(order);
	try {
		await Events.createEvent(event);
	} catch (err) {
		console.error(err.response.data.errors?.[0]);
		throw err;
	}
}

export async function syncAllOrders() {
	const orders = await prisma.order.findMany({
		where: {
			type: 'BUY',
			status: 'processed',
		},
		include: {
			user: {
				select: {
					klaviyoId: true,
				},
			},
			project: true,
		},
	});
	for (const order of orders) {
		console.log('Syncing order', order.id);
		await syncKlaviyoOrderedProduct(order);
	}
}
