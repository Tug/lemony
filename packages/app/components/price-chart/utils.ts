import { DataPoints, Prices } from '@diversifiedfinance/types';
import { Graphs } from './types';
import { scaleLinear } from 'd3-scale';
import * as shape from 'd3-shape';
import { parse } from '@diversifiedfinance/react-native-redash';
import { Dimensions } from 'react-native';
import i18n from '@diversifiedfinance/app/lib/i18n';

export const SIZE = Dimensions.get('window').width - 32;
export const MAX_POINTS = 100;

// TODO: use actual dates to sample
export function sample<T>(source: T[] | undefined, count: number) {
	if (!source || source.length === 0) {
		return [];
	}
	return [...Array(count)].map((_, sampleIndex) => {
		const indexInSource = Math.round((sampleIndex * source.length) / count);
		const srcIndex =
			indexInSource < source.length ? indexInSource : source.length - 1;
		return source[srcIndex];
	});
}

export const generatePath = (
	datapoints: DataPoints,
	width: number = SIZE,
	height: number = SIZE,
	strokeWidth: number = 2
) => {
	const priceList =
		datapoints.prices?.length > MAX_POINTS
			? sample(datapoints.prices, MAX_POINTS)
			: datapoints.prices ?? [];
	const formattedValues: Array<[number, number]> = priceList
		.map(([date, mean]) => {
			if (!Number.isNaN(date) && !Number.isNaN(mean)) {
				return [date, mean];
			}
			return undefined;
		})
		.filter(Boolean);
	const dates = formattedValues.map((value) => value[0]);
	const prices = formattedValues.map((value) => value[1]);
	const scaleX = scaleLinear()
		.domain([Math.min(...dates), Math.max(...dates)])
		.range([0, width]);
	const minPrice = Math.min(...prices);
	const maxPrice = Math.max(...prices);
	const scaleY = scaleLinear()
		.domain([minPrice, maxPrice])
		.range([height - strokeWidth, strokeWidth]);
	return shape
		.line()
		.x(([x]) => scaleX(x) as number)
		.y(([, y]) => scaleY(y) as number)
		.curve(shape.curveBasis)(formattedValues) as string;
};

export const buildGraph = (
	datapoints: DataPoints,
	label: string,
	width: number = SIZE,
	height: number = SIZE,
	strokeWidth: number = 2
) => {
	const priceList = sample(datapoints.prices, MAX_POINTS);
	const formattedValues: Array<[number, number]> = priceList
		.map(([date, mean]) => {
			if (!Number.isNaN(date) && !Number.isNaN(mean)) {
				return [date, mean];
			}
			return undefined;
		})
		.filter(Boolean);
	const dates = formattedValues.map((value) => value[0]);
	const prices = formattedValues.map((value) => value[1]);
	const scaleX = scaleLinear()
		.domain([Math.min(...dates), Math.max(...dates)])
		.range([0, width]);
	const minPrice = Math.min(...prices);
	const maxPrice = Math.max(...prices);
	const lastPrice = prices[prices.length - 1];
	const scaleY = scaleLinear()
		.domain([minPrice, maxPrice])
		.range([height - strokeWidth, strokeWidth]);
	return {
		label,
		maxPrice,
		minPrice,
		lastPrice,
		path: parse(
			shape
				.line()
				.x(([x]) => scaleX(x) as number)
				.y(([, y]) => scaleY(y) as number)
				.curve(shape.curveBasis)(formattedValues) as string
		),
		startDate: dates[0],
		endDate: dates[dates.length - 1],
		percentChange: datapoints.percent_change,
	};
};

export function getGraphs(
	values: Prices,
	width?: number,
	height?: number
): Graphs {
	return [
		values.hour &&
			values.hour.prices?.length > 0 && {
				data: buildGraph(
					values.hour,
					i18n.t('Last Hour', { context: 'graph time frame' }),
					width,
					height
				),
				label: i18n.t('1H', {
					context: '1 hour button label in graph',
				}),
				value: 0,
			},
		values.day &&
			values.day.prices?.length > 0 && {
				data: buildGraph(
					values.day,
					i18n.t('Today', { context: 'graph time frame' }),
					width,
					height
				),
				label: i18n.t('1D', {
					context: '1 day button label in graph',
				}),
				value: 1,
			},
		values.month &&
			values.month.prices?.length > 0 && {
				data: buildGraph(
					values.month,
					i18n.t('Last Month', { context: 'graph time frame' }),
					width,
					height
				),
				label: i18n.t('1M', {
					context: '1 month button label in graph',
				}),
				value: 2,
			},
		values.year &&
			values.year.prices?.length > 0 && {
				data: buildGraph(
					values.year,
					i18n.t('This Year', { context: 'graph time frame' }),
					width,
					height
				),
				label: i18n.t('1Y', {
					context: '1 year button label in graph',
				}),
				value: 3,
			},
		values.all &&
			values.all.prices?.length > 0 && {
				data: buildGraph(
					values.all,
					i18n.t('All time', { context: 'graph time frame' }),
					width,
					height
				),
				label: i18n.t('All', {
					context: 'All time button label in graph',
				}),
				value: 4,
			},
	].filter(Boolean);
}
