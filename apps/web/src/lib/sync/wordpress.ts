import {
	WP_Block_Parsed,
	WP_Block_Parsed_With_Extra,
	WP_Media,
	WP_REST_API_Oracle_Product,
	WP_REST_API_Product,
	WP_REST_API_Project,
} from '@diversifiedfinance/types';
import {
	getWPMedia,
	getWPOracleProduct,
	getWPProjects,
	getWPTags,
} from '../wordpress-rest-api';
import prisma, {
	Prisma,
	ProjectWithProductIds,
	projectWithProductIdsIncludes,
	SchemaTypes,
	userWithCompanyIncludes,
} from '../prismadb';
import { ensureProjectWallet } from '../payment/sync';
import axios from 'axios';
import { TemplateHandler } from 'easy-template-x';
import path from 'path';
import crypto from 'crypto';
import { supportedLocales } from '@diversifiedfinance/app/lib/i18n/config';
import { printMoney } from '@diversifiedfinance/app/lib/money';
import { addI18nResource, getI18nServerInstance } from '../i18n';
import { sendSimpleEmail } from '../emails/sendgrid';
import { getProjectPercent } from '../project/utils';
import { updateWalletDescription } from '../project';
import htmlToText from 'html-to-text';

function decodeEntities(encodedString) {
	const htmlEntities = {
		nbsp: ' ',
		cent: '¢',
		pound: '£',
		yen: '¥',
		euro: '€',
		copy: '©',
		reg: '®',
		lt: '<',
		gt: '>',
		quot: '"',
		amp: '&',
		apos: "'",
	};
	return encodedString.replace(/\&([^;]+);/g, function (entity, entityCode) {
		let match;
		if (entityCode in htmlEntities) {
			return htmlEntities[entityCode];
			/*eslint no-cond-assign: 0*/
		} else if ((match = entityCode.match(/^#x([\da-fA-F]+)$/))) {
			return String.fromCharCode(parseInt(match[1], 16));
			/*eslint no-cond-assign: 0*/
		} else if ((match = entityCode.match(/^#(\d+)$/))) {
			// eslint-disable-next-line no-bitwise
			return String.fromCharCode(~~match[1]);
		}
		return entity;
	});
}

export async function syncOracleProductsInDB(
	wpOracleProducts: WP_REST_API_Oracle_Product[],
	dbProduct: SchemaTypes.ProductInInventory
) {
	const oracleProducts = [];
	for (const wpOracleProduct of wpOracleProducts) {
		let data;
		try {
			data = JSON.parse(wpOracleProduct.acf.data ?? '{}');
		} catch (err) {
			// ignored malformed JSON data
			data = {};
		}
		data.id = wpOracleProduct.acf.oracle_id ?? data.id;
		data.url = wpOracleProduct.acf.oracle_url ?? data.url;
		const oracleProductData = {
			externalId: wpOracleProduct.id.toString(),
			product: {
				connect: {
					id: dbProduct.id,
				},
			},
			oracle: {
				connectOrCreate: {
					where: {
						name: wpOracleProduct.acf.oracle_name,
					},
					create: {
						name: wpOracleProduct.acf.oracle_name,
					},
				},
			},
			currency: wpOracleProduct.acf.oracle_price_currency,
			updateFrequency: wpOracleProduct.acf.oracle_update_frequency,
			hasVAT: wpOracleProduct.acf.oracle_has_vat,
			hasFees: wpOracleProduct.acf.oracle_has_fees,
			vatPercent: wpOracleProduct.acf.oracle_vat_amount || 0,
			percentageFees: wpOracleProduct.acf.oracle_percentage_fees || 0,
			fixedFees: wpOracleProduct.acf.oracle_fixed_fees || 0,
			enabled: wpOracleProduct.acf.enabled,
			data,
		};
		const oracleProduct = await prisma.oracleProduct.upsert({
			where: {
				externalId: oracleProductData.externalId.toString(),
			},
			create: oracleProductData,
			update: oracleProductData,
		});
		oracleProducts.push(oracleProduct);
	}
	return oracleProducts;
}

export async function syncProductsInDB(wpProducts: WP_REST_API_Product[]) {
	const dbProducts = [];
	for (const wpProduct of wpProducts) {
		const dbProduct = await prisma.productInInventory.upsert({
			where: {
				externalId: wpProduct.id.toString(),
			},
			create: {
				externalId: wpProduct.id.toString(),
				title: decodeEntities(wpProduct.title.rendered),
				supplier: wpProduct.acf.supplier,
			},
			update: {
				title: decodeEntities(wpProduct.title.rendered),
				supplier: wpProduct.acf.supplier,
			},
		});
		const wpOracleProducts = await Promise.all(
			// oracle_products could be an empty string thus the need for: || []
			(wpProduct.acf.oracle_products || []).map(
				(oracleProductId: number) => getWPOracleProduct(oracleProductId)
			)
		);
		const oracleProducts = await syncOracleProductsInDB(
			wpOracleProducts,
			dbProduct
		);
		dbProducts.push({
			...dbProduct,
			oracleProducts,
		});
	}
	return dbProducts;
}

export async function syncProjectsInDB(
	wpProjects: WP_REST_API_Project[],
	force: boolean = false
): Promise<Array<SchemaTypes.Project | null>> {
	const allTags = await getWPTags();

	const dbProjects: Array<SchemaTypes.Project | null> = [];
	for (const wpProject of wpProjects) {
		if (!Boolean(wpProject.acf.token_name && wpProject.acf.token_symbol)) {
			dbProjects.push(null);
			continue;
		}
		const existingProject = await prisma.project.findUnique({
			where: { tokenSymbol: wpProject.acf.token_symbol },
			include: projectWithProductIdsIncludes,
		});
		// skip if project was not changed recently on wordpress
		if (
			!force &&
			existingProject &&
			existingProject.updatedAt.getTime() >=
				new Date(wpProject.modified).getTime()
		) {
			dbProjects.push(null);
			continue;
		}
		try {
			let data;
			try {
				data = JSON.parse(wpProject.acf.data ?? '{}');
			} catch (err) {
				// ignored malformed JSON data
				data = {};
			}
			const blocks = wpProject.block_data ?? [];
			if (blocks.length === 0) {
				continue;
			}
			const tokenPrice = 10;
			const tokenDecimals = Math.max(
				wpProject.acf.token_decimals ?? 3,
				3
			); // force 3 decimals at least for now
			const mediaIds = getAllMediaInProjectContent(blocks);
			const media = await getWPMedia(mediaIds);
			const tags = (wpProject.tags ?? [])
				.map(
					(tagId) =>
						(allTags ?? []).find((tag) => tag.id === tagId)?.slug
				)
				.filter(Boolean);
			const project = {
				externalId: wpProject.id.toString(),
				slug: wpProject.slug,
				title: decodeEntities(wpProject.title.rendered),
				content: cleanupBlocks(
					blocks
				) as unknown as Prisma.InputJsonObject,
				description: decodeEntities(wpProject.excerpt.rendered),
				media: cleanupMedia(media) as unknown as Prisma.InputJsonObject,
				tags,
				expectedAPR: Number(wpProject.acf.expected_apr),
				tokenSymbol: wpProject.acf.token_symbol,
				tokenName: wpProject.acf.token_name,
				tokenDecimals,
				stoWalletAddress: wpProject.acf.sto_wallet_address || undefined,
				targetPrice: tokenPrice * wpProject.acf.max_supply,
				visibility: wpProject.acf.visibility || 'development',
				maxSupplyInDecimal:
					wpProject.acf.max_supply * Math.pow(10, tokenDecimals),
				tokenPrice,
				durationInMonths: Math.round(
					12 * wpProject.acf.duration_in_years
				),
				visibleAt: new Date(wpProject.acf.launch_date),
				crowdfundingStartsAt: new Date(
					wpProject.acf.start_of_crowdfunding_date
				),
				crowdfundingEndsAt: new Date(
					wpProject.acf.end_of_crowdfunding_date
				),
				feesPercent: wpProject.acf.diversified_fees_percent ?? 5,
				yearsForAPRCalculation: Number(
					wpProject.acf.years_for_apr_calculation
				),
				hasOwnPriceHistory: Boolean(
					wpProject.acf.has_own_price_history
				),
				isPresale: wpProject.acf.is_presale || false,
			};
			const wpProducts = (wpProject.acf.products ||
				[]) as WP_REST_API_Project['acf']['products'];
			const products = wpProducts.map((wpProduct) => ({
				product: {
					connect: {
						externalId: wpProduct.product_id.toString(),
					},
				},
				quantity: wpProduct.quantity || 1,
				unitPrice:
					wpProduct.unit_price ||
					// TODO NEXT: FIX ME: this is only temporary
					//  as it won't work for projects with different products
					project.targetPrice / wpProduct.quantity,
				priceIncludesVAT:
					typeof wpProduct.price_includes_vat !== 'undefined'
						? Boolean(wpProduct.price_includes_vat)
						: false,
				...(wpProduct.purchase_date && {
					purchaseDate: wpProduct.purchase_date,
				}),
				vatPercentage: wpProduct.vat_percentage || 0,
				resaleFeePercent: wpProduct.resale_fee_percent || 0,
				resaleFeeFixed: wpProduct.resale_fee_fixed || 0,
			}));
			const hasProducts = products && products.length > 0;
			const projectMaxBalance =
				(Number(project.maxSupplyInDecimal) * project.tokenPrice) /
				Math.pow(10, project.tokenDecimals);
			if (wpProject.acf.owner_email) {
				const owner = await prisma.user.findFirst({
					where: { email: wpProject.acf.owner_email },
					select: {
						id: true,
					},
				});
				if (!owner) {
					continue;
				}
				// wrapped in a transaction to prevent having an empty product list
				const updatedProject = await prisma.$transaction(async (tx) => {
					// remove existing projects to products relations
					if (
						existingProject &&
						existingProject.products.length > 0
					) {
						await tx.productsInProjects.deleteMany({
							where: {
								projectId: existingProject.id,
							},
						});
					}
					return await tx.project.upsert({
						where: {
							id: existingProject?.id ?? '-',
						},
						create: {
							...project,
							owner: {
								connect: {
									id: owner.id,
								},
							},
							crowdfundingState: {
								create: {
									collectedAmount: 0,
									maximumAmount: projectMaxBalance,
								},
							},
							...(hasProducts && {
								products: {
									create: products,
								},
							}),
						},
						update: {
							...project,
							owner: {
								connect: {
									id: owner.id,
								},
							},
							...(hasProducts && {
								products: {
									create: products,
								},
							}),
							crowdfundingState: {
								upsert: {
									where: {
										id:
											existingProject?.crowdfundingState
												?.id ?? '-',
									},
									create: {
										collectedAmount: 0,
										maximumAmount: projectMaxBalance,
									},
									update:
										!existingProject ||
										// do not update if project crowdfunding has started
										getProjectPercent(existingProject) === 0
											? {
													maximumAmount:
														projectMaxBalance,
											  }
											: {},
								},
							},
						},
						include: projectWithProductIdsIncludes,
					});
				});

				dbProjects.push(updatedProject);

				await updateDocumentUrl(
					updatedProject,
					wpProject.acf.template_url
				);

				try {
					await ensureProjectWallet(updatedProject);
				} catch (err) {
					console.error(err);
				}
				try {
					await ensureProjectWallet(updatedProject, {
						useSandbox: true,
					});
				} catch (err) {
					console.error(err);
				}

				// update wallet description
				if (existingProject && existingProject.slug !== project.slug) {
					try {
						await updateWalletDescription(project);
					} catch (err) {
						console.error(err);
					}
				}

				try {
					for (const locale of supportedLocales) {
						if (locale === 'en') {
							continue;
						}
						await syncI18NProject(updatedProject, locale);
					}
				} catch (err) {
					console.error(err);
				}
			}
		} catch (err) {
			console.error(
				`Error while syncing project: ${wpProject.acf.token_symbol} ${wpProject.slug}`
			);
			console.error(err);
			if (!__DEV__) {
				await sendSimpleEmail(
					`Error while syncing project: ${
						wpProject.acf.token_symbol
					} ${wpProject.slug}\n${err?.toString()}`
				);
			}
		}
	}

	return dbProjects;
}

export async function syncI18NProject(
	project: SchemaTypes.Project,
	lang: string
) {
	const wpProjects = await getWPProjects({
		slug: project.slug,
		lang,
	});
	if (!wpProjects || wpProjects.length === 0) {
		throw new Error(
			`Could not find project with slug ${project.slug} and lang ${lang}`
		);
	}
	const wpProject = wpProjects[0];
	const title = decodeEntities(wpProject?.title?.rendered) ?? project.title;
	const content = wpProject?.block_data
		? cleanupBlocks(wpProject.block_data)
		: project.content;
	const description =
		decodeEntities(wpProject?.excerpt?.rendered) ?? project.description;
	await prisma.projectI18N.upsert({
		where: {
			projectId_lang: {
				projectId: project.id,
				lang,
			},
		},
		create: {
			projectId: project.id,
			lang,
			title,
			content,
			description,
		},
		update: {
			title,
			content,
			description,
		},
	});
}

const cleanupBlocks = (
	blocks: WP_Block_Parsed_With_Extra[]
): WP_Block_Parsed_With_Extra[] => {
	return traverseBlocksAndUpdate(blocks, (block) => ({
		...block,
		attrs: {
			...block.attrs,
			content:
				block.attrs.content ??
				(block.innerHTML
					? htmlToText.convert(block.innerHTML, {
							uppercaseHeadings: false,
					  })
					: null),
		},
		rendered: '',
		innerHTML: '',
		innerContent: [],
	}));
};

const cleanupMedia = (medias: WP_Media[]): WP_Media[] => {
	return medias.map((media: WP_Media) => ({
		...media,
		media_details: {
			...media.media_details,
			sizes: Object.fromEntries(
				Object.entries(media.media_details.sizes ?? {}).filter(
					([sizeKey]) =>
						['full', 'medium', 'thumbnail'].includes(sizeKey)
				)
			),
		},
	}));
};

const isVisible = (project: WP_REST_API_Project): boolean => {
	const visibilityLevels = {
		production: 0,
		staging: 1,
		development: 2,
	};
	const currentBuildVisibilityLevel =
		visibilityLevels[process.env.STAGE as keyof typeof visibilityLevels] ??
		4;
	// all projects that have a lower or equal visibility value are visible
	return (
		visibilityLevels[
			project.acf.visibility as keyof typeof visibilityLevels
		] <= currentBuildVisibilityLevel
	);
};

function traverseBlocksAndFind<T>(
	postContent: WP_Block_Parsed[] = [],
	result: T[],
	predicate: (block: WP_Block_Parsed) => T
) {
	postContent.forEach((block) => {
		const data = predicate(block);
		if (data) {
			result.push(data);
		}
		if (block.innerBlocks) {
			traverseBlocksAndFind(block.innerBlocks, result, predicate);
		}
	});
}

function traverseBlocksAndUpdate(
	postContent: WP_Block_Parsed_With_Extra[],
	update: (block: WP_Block_Parsed_With_Extra) => WP_Block_Parsed_With_Extra
): WP_Block_Parsed_With_Extra[] {
	return postContent.map((block) => {
		return {
			...update(block),
			...(block.innerBlocks && {
				innerBlocks: traverseBlocksAndUpdate(block.innerBlocks, update),
			}),
		};
	});
}

export function getAllMediaInProjectContent(
	content: WP_Block_Parsed[]
): number[] {
	if (!content) {
		return [];
	}
	const result: number[][] = [];
	traverseBlocksAndFind<number[]>(
		content,
		result,
		(block) => block.attrs.ids
	);
	return result.flat(2);
}

export async function updateDocumentUrl(
	project: ProjectWithProductIds,
	templateUrl: string = 'https://getdiversified.app/security-tokens-tc-2023.docx',
	recreate: boolean = false
) {
	const documentUrl = await getDocumentUrl(project, templateUrl);
	if (project.documentUrl !== documentUrl) {
		await prisma.project.update({
			where: { id: project.id },
			data: {
				documentUrl,
			},
		});
		project.documentUrl = documentUrl;
	}

	for (const locale of supportedLocales) {
		if (locale === 'en') {
			continue;
		}
		const i18n = await getI18nServerInstance(locale);
		if (i18n.t(documentUrl) === documentUrl || recreate) {
			await getDocumentUrl(project, templateUrl, locale);
		}
	}
	return documentUrl;
}

export async function getDocumentUrl(
	project: ProjectWithProductIds,
	templateUrl?: string,
	lang?: string
) {
	const i18n = await getI18nServerInstance(lang);
	// TODO: include project's documentUrl into the i18n generation
	const staticDocumentUrlsForTranslation = [
		i18n.t(
			'https://getdiversified.app/wp-content/uploads/2023/11/Diversified_PropCo_STO_17042023_Template_en.docx'
		),
		i18n.t('https://getdiversified.app/security-tokens-tc-2023.docx'),
	];
	if (!templateUrl) {
		return undefined;
	}
	if (templateUrl.endsWith('.pdf')) {
		return templateUrl;
	}
	if (!templateUrl.endsWith('.docx')) {
		return i18n.t(project.documentUrl ?? templateUrl);
	}
	const projectOwner = project.ownerId
		? await prisma.user.findUnique({
				where: { id: project.ownerId },
				include: userWithCompanyIncludes,
		  })
		: null;
	const templateData = {
		lang,
		tokenSymbol: project.tokenSymbol,
		tokenPrice: printMoney(project.tokenPrice.toNumber(), 'EUR', i18n),
		projectDescription: `\n${project.title}`,
		sellerName:
			projectOwner?.company?.name ?? 'Diversified PropCo S.à r.l.',
		targetPrice: printMoney(project.targetPrice.toNumber(), 'EUR', i18n),
		projectDuration: Intl.NumberFormat(i18n.language, {
			style: 'unit',
			unit: 'month',
			unitDisplay: 'long',
		}).format(project.durationInMonths),
		vatYesOrNo: (project.products ?? []).some(
			(product) => product.priceIncludesVAT
		)
			? i18n.t('Yes')
			: i18n.t('No'),
		projectEndDate: new Date(
			project.crowdfundingStartsAt.getTime() +
				project.durationInMonths * 30.5 * 24 * 60 * 60 * 1000
		).toLocaleDateString(i18n.language),
	};
	const docHash =
		crypto
			.createHash('sha1')
			.update(JSON.stringify(templateData))
			.digest('hex')
			.slice(0, 8) ?? '';
	const docName = `Diversified_TC_${project.tokenSymbol}_${docHash}_${
		lang?.toUpperCase() ?? 'EN'
	}.pdf`;
	try {
		const existRes = await axios.post(
			'https://hfltu6zgfiz7bqyphwbp4sfove0jixsb.lambda-url.eu-west-3.on.aws/convert',
			{
				dstKey: docName,
				exist: true,
			}
		);
		// file exists
		return existRes.data.url;
	} catch (err) {
		// file does not exist
	}
	// if the hash match then no need to regenerate the document
	if (project.documentUrl?.endsWith(docName)) {
		return project.documentUrl;
	}
	const document = await axios.get(i18n.t(templateUrl), {
		responseType: 'arraybuffer',
		headers: {
			Accept: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		},
	});
	const templateHandler = new TemplateHandler();
	const outputDoc = await templateHandler.process(
		document.data,
		templateData
	);
	// TODO: service discovery?
	const response = await axios.post(
		'https://hfltu6zgfiz7bqyphwbp4sfove0jixsb.lambda-url.eu-west-3.on.aws/convert',
		{
			filename: path.basename(templateUrl),
			encoding: 'base64',
			data: Buffer.from(outputDoc).toString('base64'),
			dstKey: docName,
		}
	);
	const url = response.data?.url;
	if (url && lang && project.documentUrl && !i18n.exists(url)) {
		await addI18nResource(i18n, lang, project.documentUrl, url);
	}
	return url;
}
