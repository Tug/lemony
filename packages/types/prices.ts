export interface Amount {
	amount: string;
	currency: string;
	scale: string;
}

export interface PercentChange {
	hour: number;
	day: number;
	week: number;
	month: number;
	year: number;
}

export type Price = [number, number, number?, number?]; // date, mean, min?, max?

export type PriceList = Price[];

export interface DataPoints {
	percent_change: number;
	prices: PriceList;
}

export interface Prices {
	latest?: {
		amount: Amount;
		timestamp: string;
		percent_change: PercentChange;
	};
	latest_price?: Price;
	hour?: DataPoints;
	day?: DataPoints;
	week?: DataPoints;
	month?: DataPoints;
	year?: DataPoints;
	all?: DataPoints;
}
