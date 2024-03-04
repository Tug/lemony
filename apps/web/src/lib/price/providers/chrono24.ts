import {
	BrowserContext,
	Capability,
	CrawlingResult,
	SnapshotData,
	Step,
} from '../types';
import { takeScreenshot } from '../common/capabilities/browser';

const localCache = {};

export const capabilities: Capability[] = ['browser'];

const chrono24Periods = [
	'max',
	'_5years',
	'_3years',
	'_1year',
	'_6months',
	'_3months',
	'_1month',
] as const;
export type Chrono24PeriodsType = (typeof chrono24Periods)[number];
export const minPeriod: Chrono24PeriodsType = '_1month';

interface Chrono24PriceResponse {
	availablePeriods: Array<{ label: string; value: Chrono24PeriodsType }>;
	coordinatesPostPurchase: Array<{
		x: { label: string; value: string };
		xAxisLabel: string;
		y: {
			max?: { label: string; value: number };
			mean?: { label: string; value: number };
			min?: { label: string; value: number };
		};
	}>;
	coordinatesPrePurchase: Array<any>;
	currency: string;
	period: Chrono24PeriodsType;
	purchasedInPeriod: boolean;
}

function postProcessData(data: Chrono24PriceResponse): SnapshotData {
	const timeseries = data.coordinatesPostPurchase;
	return timeseries
		.map(({ x, y }) =>
			!y.mean?.value
				? null
				: [
						x.value,
						{
							mean: y.mean.value,
							...(y.max?.value && { max: y.max.value }),
							...(y.min?.value && { min: y.min.value }),
						},
				  ]
		)
		.filter(Boolean);
}

export const steps: Step<BrowserContext>[] = [
	async function login({ page }: BrowserContext) {
		if (localCache.cookies) {
			try {
				await page.setCookie(...JSON.parse(localCache.cookies));
			} catch (err) {
				// ignore error
			}
		}
		await page.setCookie({
			name: 'c24-consent',
			value: 'AAAAIM/vwf4B',
			domain: 'www.chrono24.fr',
			path: '/',
			secure: true,
			httpOnly: true,
			sameSite: 'None',
			expires: Math.round(Date.now() / 1000) + 3600 * 24 * 365,
		});
		// in case the consent cookie does not work
		try {
			await page.click('.js-cookie-accept-all');
		} catch (err) {
			// ignore error, modal was probably not there
		}
		await page.goto('https://www.chrono24.fr', {
			waitUntil: 'networkidle2',
		});
		if (
			Boolean(await page.$('a[aria-label="Se connecter ou s\'inscrire"]'))
		) {
			await page.click('a[aria-label="Se connecter ou s\'inscrire"]');
			try {
				await page.waitForNavigation({
					waitUntil: 'networkidle2',
					timeout: 2000,
				});
			} catch (e) {
				// ignore timout error
			}
			await page.$eval(
				'#email',
				(el, username) => (el.value = username),
				process.env.CHRONO24_USERNAME
			);
			await page.$eval(
				'#password',
				(el, password) => (el.value = password),
				process.env.CHRONO24_PASSWORD
			);
			// await page.type('#email', process.env.CHRONO24_USERNAME);
			// await new Promise((resolve) => setTimeout(resolve, 1000));
			// await page.type('#password', process.env.CHRONO24_PASSWORD);
			await new Promise((resolve) => setTimeout(resolve, 1000));
			// await page.click('#userLogInPermanently');
			// click and wait for navigation
			await page.click('button[type="submit"]');
			try {
				await page.waitForSelector('#profile-card-filled', {
					timeout: 5000,
				});
				// do what you have to do here
			} catch (e) {
				throw new Error('Failed to log in');
			}
			const cookies = await page.cookies();
			if (cookies && cookies.length > 0) {
				localCache.cookies = JSON.stringify(await page.cookies());
			}
		}
		// await page.goto('https://www.chrono24.fr/auth/login.htm', {
		// 	waitUntil: 'networkidle2',
		// });
		// make sure we've accepted the consent cookie
		// TODO: cache cookies, otherwise this will always be false
		// const isLoggedIn = Boolean(await page.$('#profile-card-filled'));
		// if (!isLoggedIn) {
		//
		// }
		return {};
	},
	async function fetchData({
		page,
		params: { oracleName },
		productData: { id: oracleId, url },
	}: BrowserContext) {
		if (!oracleId && url) {
			oracleId = url.match(/id(\d+)\.htm/)[1];
		}
		// Too lazy to get cookies and serialize it for fetch
		// Let's use puppeteer instead since we have it loaded
		const results: CrawlingResult = {};
		for (const period of chrono24Periods) {
			await page.goto(
				`https://www.chrono24.fr/api/watch/collection/item/chart/price.json?watchId=${oracleId}&period=${period}`
			);
			await page.content();
			try {
				const data = await page.evaluate(() => {
					return JSON.parse(document.querySelector('body').innerText);
				});
				if (data && !data.errors) {
					results[period] = postProcessData(data);
				}
			} catch (err) {
				console.error(
					"Error while evaluating `JSON.parse(document.querySelector('body').innerText);` in page ",
					page.url(),
					err
				);
			}
		}
		return results;
	},
	async function handleFailure(
		context: BrowserContext,
		result: CrawlingResult
	) {
		if (!result || Object.keys(result).length === 0) {
			let screenshotUrl;
			try {
				screenshotUrl = await takeScreenshot(context);
			} catch (err) {}
			throw new Error('Failed crawling');
		}
		return result;
	},
];
