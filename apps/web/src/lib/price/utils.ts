import {
	DataPoints,
	Price,
	PriceList,
	Prices,
} from '@diversifiedfinance/types';
import { CrawledPeriod, DiversifiedPeriod, PriceResult } from './types';
import { SchemaTypes } from '../prismadb';

export const periodMapper: { [p in CrawledPeriod]?: DiversifiedPeriod } = {
	_1month: 'month',
	_1year: 'year',
	max: 'all',
	all: 'all',
};

export function formatPrice(price?: SchemaTypes.Price): Price | undefined {
	if (!price || !price.date || !price.mean) {
		return undefined;
	}
	return [
		price.date.getTime(),
		price.mean.toNumber(),
		price.min?.toNumber(),
		price.max?.toNumber(),
	];
}

const sum = (values: any[]) =>
	values.reduce(
		(previousValue, currentValue) => previousValue + currentValue,
		0
	);
const mean = (values: any[]) => sum(values) / values.length;

export const MathPrices = {
	sum({
		prices = [],
		weights,
	}: {
		prices: Price[];
		weights?: number[];
	}): Price {
		const w = weights ?? [...Array(prices.length)].map(() => 1);
		// assumes dates match
		// TODO: better grouping methods
		return [
			// first item is time
			prices[0]?.[0],
			sum(
				prices.map((price, index) =>
					price[1] ? price[1] * w[index] : undefined
				)
			),
			sum(
				prices.map((price, index) =>
					price[2] ? price[2] * w[index] : undefined
				)
			),
			sum(
				prices.map((price, index) =>
					price[3] ? price[3] * w[index] : undefined
				)
			),
		];
	},
	mean({
		prices = [],
		weights,
	}: {
		prices: Price[];
		weights?: number[];
	}): Price {
		const w = weights ?? [...Array(prices)].map(() => 1);
		return [
			prices[0]?.[0],
			mean(
				prices
					.map((price, index) =>
						price[1] ? price[1] * w[index] : undefined
					)
					.filter(Boolean)
			),
			mean(
				prices
					.map((price, index) =>
						price[2] ? price[2] * w[index] : undefined
					)
					.filter(Boolean)
			),
			mean(
				prices
					.map((price, index) =>
						price[3] ? price[3] * w[index] : undefined
					)
					.filter(Boolean)
			),
		];
	},
};

export const sumDataPoints = ({
	datapoints = [],
	weights,
}: {
	datapoints: DataPoints[];
	weights: number[];
}): DataPoints => {
	return {
		percent_change: mean(
			datapoints.map(({ percent_change }) => percent_change)
		),
		prices:
			datapoints?.[0]?.prices?.map((_, index) => {
				return MathPrices.sum({
					prices: datapoints.map(({ prices }) => prices[index]),
					weights,
				});
			}) ?? [],
	};
};

export function getPercentChangeDatapoints(data: PriceList) {
	if (!data || data.length === 0) {
		return undefined;
	}
	const firstPrice = data[0]?.[1];
	const lastPrice = data[data.length - 1]?.[1];
	if (firstPrice && lastPrice) {
		return (lastPrice / firstPrice - 1) * 100;
	}
	return undefined;
}

export function dbResultsToPrices(prices: Array<PriceResult>): Prices {
	let latestPrice = null;
	const pricesPerPeriods = prices.reduce((result, priceRow) => {
		const period = periodMapper[priceRow.period];
		if (!period) {
			return result;
		}
		if (!result[period]) {
			result[period] = {
				percent_change: 0,
				prices: [],
			};
		}
		const price = formatPrice(priceRow);
		if (!price) {
			return result;
		}
		result[period].prices.push(price);
		if (period === 'month' && (!latestPrice || latestPrice[0] < price[0])) {
			latestPrice = price;
		}
		return result;
	}, {} as Prices);
	Object.keys(pricesPerPeriods).forEach((period) => {
		pricesPerPeriods[period].percent_change = getPercentChangeDatapoints(
			pricesPerPeriods[period].prices
		);
	});
	return {
		latest: undefined,
		latest_price: latestPrice,
		...pricesPerPeriods,
	};
}
