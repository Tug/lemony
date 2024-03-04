import {
	BrowserContext,
	Capability,
	Context,
	CrawlingResult,
	SnapshotData,
	Step,
} from '../types';
import { takeScreenshot } from '../common/capabilities/browser';
import getPixels from 'get-pixels';
import { promisify } from 'util';
import crypto from 'crypto';

export const capabilities: Capability[] = ['browser'];

const wineSearchersPeriods = ['max'] as const;

export type WineSearchersType = (typeof wineSearchersPeriods)[number];
export const minPeriod: WineSearchersType = 'max';

type WineSearchersGraphData = Array<[number, number]>;

export function postProcessData(
	data: WineSearchersGraphData,
	context: Context
): SnapshotData {
	return data.map(([date, value]) => [
		date.toString(),
		{ mean: Number(value) },
	]);
}

let localCache = {};

async function getCacheFilePath() {
	const thisFileData = await promisify(require('fs').readFile)(__filename);
	const cacheVersion = crypto.createHash('md5').update(thisFileData).digest();
	const cacheFile = `${require('os').tmpdir()}/diversified-crawler-cookies-${cacheVersion}.json`;
	return cacheFile;
}

async function loadLocalCache() {
	const cacheFile = await getCacheFilePath();
	try {
		const data = await promisify(require('fs').readFile)(cacheFile, {
			encoding: 'utf8',
		});
		localCache = JSON.parse(data);
	} catch (err) {
		// ignore err
	}
}

async function persistLocalCache() {
	const cacheFile = await getCacheFilePath();
	try {
		await promisify(require('fs').writeFile)(
			cacheFile,
			JSON.stringify(localCache),
			{
				encoding: 'utf8',
			}
		);
	} catch (err) {
		console.log('error writing local cache in temp', err);
	}
}

async function tryByPassPerimeterX(context: BrowserContext) {
	const { page } = context;
	// button can take a few seconds to load
	await page.waitForSelector('#px-captcha', { timeout: 10000 });
	await new Promise((resolve) => setTimeout(resolve, 3000));
	const captchaButton = await page.$('#px-captcha');
	const buttonPosition = await page.evaluate((button) => {
		const { x, y, width, height } = button.getBoundingClientRect();
		return { x, y, width, height };
	}, captchaButton);
	const clickPosition = {
		x: buttonPosition.x + buttonPosition.width / 2 + 5,
		y: buttonPosition.y + buttonPosition.height / 2 + 2,
	};
	// iframe can take a few seconds to load
	await new Promise((resolve) => setTimeout(resolve, 3000));
	await page.mouse.move(clickPosition.x, clickPosition.y);
	await page.mouse.down();
	await new Promise((resolve) => setTimeout(resolve, 3000));
	for (let i = 0; i < 20; i++) {
		const buffer = await captchaButton.screenshot();
		const pixels = await promisify(getPixels)(buffer, 'image/png');
		let blueRatio = 0;
		for (let x = 0; x < pixels.shape[0]; x++) {
			for (let y = 0; y < pixels.shape[1]; y++) {
				const bluePixel = pixels.get(x, y, 2); // channels is RGBA, so 2 is B
				if (bluePixel < 200) {
					blueRatio++;
				}
			}
		}
		blueRatio = (100 * blueRatio) / (pixels.shape[0] * pixels.shape[1]);
		if (blueRatio > 29) {
			await new Promise((resolve) => setTimeout(resolve, 3000));
			// await promisify(require('fs').writeFile)(
			// 	'./captcha-onup.png',
			// 	buffer
			// );
			break;
		} else {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}
	await page.mouse.up();
	await context.page.waitForNavigation({
		waitUntil: 'networkidle2',
	});
}

async function getTimeseries(context: BrowserContext) {
	const data: any = await context.page.evaluate(
		'options_hst_price_div_detail_page.series[0].data'
	);
	if (!data) {
		return {};
	}
	const timeseries = postProcessData(data, context);
	return timeseries ? { max: timeseries } : {};
}

async function gotoPage(context, url) {
	const { page } = context;
	try {
		await page.goto(url, {
			waitUntil: 'networkidle2',
		});
		if (!(await page.$('.site-logo'))) {
			throw new Error(
				'Site logo not found. PerimeterX is likely blocking us'
			);
		}
	} catch (err) {
		console.log(err);
		let tries = 3;
		while (tries-- > 0) {
			if (await page.$('.site-logo')) {
				break;
			}
			await tryByPassPerimeterX(context);
			await page.goto(url, {
				waitUntil: 'networkidle2',
			});
		}
	}
}

async function waitForNavigation(context) {
	const { page } = context;
	try {
		await page.waitForNavigation({
			waitUntil: 'networkidle2',
		});
		if (!(await page.$('.site-logo'))) {
			throw new Error(
				'Site logo not found. PerimeterX is likely blocking us'
			);
		}
	} catch (err) {
		console.log(err);
		let tries = 3;
		while (tries-- > 0) {
			if (await page.$('.site-logo')) {
				break;
			}
			await tryByPassPerimeterX(context);
			await page.waitForNavigation({
				waitUntil: 'networkidle2',
			});
		}
	}
}

export const steps: Step<BrowserContext>[] = [
	async function fakeBrowserHistory(context: BrowserContext) {
		const { page } = context;
		await loadLocalCache();
		if (localCache.cookies) {
			try {
				await page.setCookie(...JSON.parse(localCache.cookies));
			} catch (err) {
				// ignore error
			}
		}
		await gotoPage(context, 'https://www.wine-searcher.com/');
		try {
			await page.click('a.cookie-accept');
			// await page.type(
			// 	'#Xwinename',
			// 	'2018 Domaine de la Romanee-Conti Grands Echezeaux Grand Cru'
			// );
			const cookies = await page.cookies();
			if (cookies && cookies.length > 0) {
				localCache.cookies = JSON.stringify(await page.cookies());
			}
		} catch (err) {}
	},
	async function login(context: BrowserContext) {
		const { page } = context;
		await page.waitForSelector('.page-nav__open-menu.js-open-account');
		const topRightText = await page.$eval(
			'.page-nav__open-menu.js-open-account',
			(el) => el.textContent.trim()
		);
		if (topRightText === 'Sign In') {
			await gotoPage(
				context,
				'https://www.wine-searcher.com/sign-in?pro_redirect_url_F=%2F'
			);
			await page.type(
				'#loginmodel-username',
				process.env.WINESEARCHER_USERNAME
			);
			await page.type(
				'#loginmodel-password',
				process.env.WINESEARCHER_PASSWORD
			);
			await page.$eval('#cookie_ok_F', (check) => (check.checked = true));
			await new Promise((resolve) => setTimeout(resolve, 3000));
			await page.click('button[type="submit"]', { delay: 200 });
			await waitForNavigation(context);
			const cookies = await page.cookies();
			if (cookies && cookies.length > 0) {
				localCache.cookies = JSON.stringify(await page.cookies());
				await persistLocalCache();
			}
		}
	},
	async function getData(context: BrowserContext) {
		const {
			page,
			params: { oracleName },
			productData: { id: oracleId, url: oracleUrl },
		} = context;
		if (context.productData?.search) {
			await gotoPage(context, 'https://www.wine-searcher.com/');
			// 3 clicks to select existing content so we overwrite it
			await page.click('#Xwinename', { clickCount: 3 });
			await page.type('#Xwinename', context.productData?.search);
			await page.keyboard.press('Enter');
			await waitForNavigation(context);
		} else {
			await gotoPage(context, context.productData?.url);
		}
		try {
			return getTimeseries(context);
		} catch (err) {
			context.error = err;
			return {};
		}
	},
	async function handleFailure(
		context: BrowserContext,
		result: CrawlingResult
	) {
		if (!result || Object.keys(result).length === 0) {
			const screenshotUrl = await takeScreenshot(context);
			if (!context.screenshots) {
				context.screenshots = [];
			}
			context.screenshots.push(screenshotUrl);
			if (context.error) {
				throw context.error;
			}
			throw new Error('Failed to fetch price');
		}
		return result;
	},
];
