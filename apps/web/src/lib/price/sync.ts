import {
	Capability,
	Context,
	CrawledPeriod,
	CrawlingResult,
	SnapshotData,
	Step,
} from './types';
import { Prisma } from '../prismadb';
import * as chrono24 from './providers/chrono24';
import * as cavissima from './providers/cavissima';
import * as idealwine from './providers/idealwine';
import * as winesearcher from './providers/wine-searcher';
// import * as patriwine from './providers/patriwine';
import * as capabilities from './common/capabilities';
import { saveSnapshot } from './common';

const stories: Record<
	string,
	{
		steps: Step<any>[];
		capabilities: Capability[];
		minPeriod: CrawledPeriod;
		postProcessData?: (data: any, context: Context) => SnapshotData;
	}
> = {
	chrono24,
	cavissima,
	idealwine,
	winesearcher,
	// patriwine,
};

export default async function refreshPrice(
	oracleProduct: Prisma.OracleProduct
): Promise<CrawlingResult> {
	const story = stories[oracleProduct.oracle.name];
	if (!story) {
		throw new Error('Oracle not supported');
	}

	const productData =
		oracleProduct.data && typeof oracleProduct.data === 'object'
			? oracleProduct.data
			: {};
	const context: Context = {
		params: {
			oracleProductId: oracleProduct.id,
			oracleName: oracleProduct.oracle.name,
			...(oracleProduct.oracleUrl && {
				oracleUrl: oracleProduct.oracleUrl,
			}),
			...(productData.id && {
				oracleId: productData.id,
			}),
		},
		productData,
	};

	// TODO nice to have: use typescript magic to automatically return a context
	// with capabilities
	await Promise.all(
		(story.capabilities ?? []).map((capability) =>
			capabilities[capability](context)
		)
	);

	let result: CrawlingResult = {};
	try {
		for (const step of story.steps) {
			result = await step(context, result);
		}
	} catch (err) {
		if (context.productData.rawPrices && story.postProcessData) {
			const timeseries = story.postProcessData(
				context.productData.rawPrices,
				context
			);
			result = timeseries ? { max: timeseries } : {};
		} else {
			// TODO: send us an email with the error data
			console.error(
				'Error while crawling page: ',
				context.page ? context.page.url() : 'unknown',
				err,
				'Context was: ',
				{
					params: context.params,
					productData: context.productData,
					screenshots: context.screenshots,
				}
			);
			err.context = {
				page: context.page ? context.page.url() : 'unknown',
				params: context.params,
				productData: context.productData,
				screenshots: context.screenshots,
			};
			throw err;
		}
	} finally {
		await context.page?.close();
		await context.browser?.close();
	}

	const metadata = {
		source: oracleProduct.oracle.name,
		currency: 'EUR',
		// this is a private method so it should be fine not to check against injection at the moment
		// TODO: find a general fix against injections?
		productData,
	};

	for (const [period, data] of Object.entries(result)) {
		await saveSnapshot({
			oracleProductId: oracleProduct.id,
			period,
			data,
			metadata,
		});
	}

	return result;
}
