import { Capability, Context, SnapshotData, Step } from '../types';

export const capabilities: Capability[] = [];

const cavisslimaPeriods = ['all'] as const;

export type CavisslimaPeriodsType = (typeof cavisslimaPeriods)[number];
export const minPeriod: CavisslimaPeriodsType = 'all';

const datasources = {
	avgprice: (oracleId: string) =>
		`https://www.cavissima.com/productview/product/averagePricePerVintageDataJson/productId/${oracleId}`,
	outprice: (oracleId: string) =>
		`https://www.cavissima.com/productview/product/outPricePerVintageDataJson/productId/${oracleId}`,
	similarProductResellData: (oracleId: string) =>
		`https://www.cavissima.com/productview/product/similarProductResellDataJson/productId/${oracleId}`,
};

function postProcessData(data: any, context: Context): SnapshotData {
	const vintage = context.productData?.vintage;
	const dataIndex = vintage
		? (data.millesime ?? []).indexOf(Number(vintage))
		: 0;
	if (dataIndex >= 0) {
		const prices = data.price?.[dataIndex].map(Number);
		const dates = data.date;
		const combined = dates.map((date: string, index: number) => {
			return [date, { mean: prices[index] }];
		});
		return trimArray(
			combined,
			([, { mean }]: [
				string,
				{ mean: number; min: number; max: number }
			]) => !isNaN(mean)
		);
	}
	return [];
}

// Available on Array.prototype once we upgrade to node 18
function findLastIndex<T>(
	arr: Array<T>,
	callback: (value: T, index: number, arr: Array<T>) => boolean,
	thisArg?: any
) {
	for (let index = arr.length - 1; index >= 0; index--) {
		const value = arr[index];
		if (callback.call(thisArg, value, index, arr)) {
			return index;
		}
	}
	return -1;
}

function trimArray<T>(timeseries: Array<T>, predicate: (entry: T) => boolean) {
	const firstDataIndex = timeseries.findIndex(predicate);
	const lastDataIndex = findLastIndex(timeseries, predicate);
	return timeseries.slice(
		firstDataIndex ?? 0,
		lastDataIndex + 1 ?? timeseries.length
	);
}

export const steps: Step<Context>[] = [
	async function fetchPrices(context: Context) {
		let {
			productData: { id: oracleId, url },
		} = context;
		if (!oracleId && url) {
			oracleId = url.match(/\d+/g)?.pop();
		}
		if (!context.productData.vintage) {
			try {
				const response = await fetch(
					datasources.similarProductResellData(oracleId)
				);
				const data = await response.json();
				context.productData.vintage = data?.[0].vintage;
			} catch (err) {}
		}
		const response = await fetch(datasources.avgprice(oracleId));
		const data = await response.json();
		const timeseries = postProcessData(data, context);
		return timeseries ? { max: timeseries } : {};
	},
];
