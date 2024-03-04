import { Browser, Page } from 'puppeteer';
import { Chrono24PeriodsType } from './providers/chrono24';
import { IDealwinePeriodsType } from './providers/idealwine';
import { CavisslimaPeriodsType } from './providers/cavissima';

export interface Context {
	params: Record<string, string>;
	browser?: Browser;
	page?: Page;
	productData: any;
	screenshots?: string[];
	lastError?: Error;
}

export type BrowserContext = Required<Context>;

export type CrawlingResult = { [period in CrawledPeriod]?: SnapshotData };

export type Step<T extends Context> = (
	context: T,
	previousStepResult: CrawlingResult
) => Promise<CrawlingResult>;

export type Capability = 'browser';

export type CrawledPeriod =
	| Chrono24PeriodsType
	| IDealwinePeriodsType
	| CavisslimaPeriodsType;

export type DiversifiedPeriod = 'day' | 'week' | 'month' | 'year' | 'all';

export type SnapshotPrice = [
	string,
	{ mean: number; min?: number; max?: number }
];
export type SnapshotData = Array<SnapshotPrice>;

export type PriceResult = {
	period: CrawledPeriod;
	date: Date;
	mean: number;
	min?: number;
	max?: number;
};
