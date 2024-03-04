import {
	BrowserContext,
	Capability,
	Context,
	CrawlingResult,
	SnapshotData,
	Step,
} from '../types';
import { takeScreenshot } from '../common/capabilities/browser';

export const capabilities: Capability[] = ['browser'];

const localCache = {};

const iDealwinePeriods = ['all'] as const;

export type IDealwinePeriodsType = (typeof iDealwinePeriods)[number];
export const minPeriod: IDealwinePeriodsType = 'all';

interface IdealwineConfigData {
	dataset: string[];
	labels: string[];
}

function postProcessData(
	{ dataset, labels }: IdealwineConfigData,
	context: Context
): SnapshotData {
	return labels.map((label, index) => [
		label,
		{ mean: Number(dataset?.[index]) },
	]);
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
			name: 'OptanonAlertBoxClosed',
			value: new Date(Date.now() - 1000 * 60).toISOString(),
			domain: '.idealwine.com',
			path: '/',
			secure: false,
			httpOnly: false,
			sameSite: 'Lax',
			expires: Math.round(Date.now() / 1000) + 3600 * 24 * 365,
		});
		await page.goto('https://www.idealwine.com', {
			waitUntil: 'networkidle2',
		});
		await new Promise((resolve) => setTimeout(resolve, 2000));
		// in case the consent cookie trick did not work
		try {
			await page.click('#onetrust-accept-btn-handler');
		} catch (err) {
			// ignore error, modal was probably not there
		}
		// dismiss any modal
		try {
			await page.click('#onesignal-slidedown-cancel-button');
		} catch (err) {
			// ignore error, modal was probably not there
		}
		if (Boolean(await page.$('#dropDown'))) {
			// already logged in
			return {};
		}
		await page.goto('https://www.idealwine.com/fr/my_idealwine/login.jsp', {
			waitUntil: 'networkidle2',
		});
		await new Promise((resolve) => setTimeout(resolve, 1000));
		await page.type('input[name="ident"]', process.env.IDEALWINE_USERNAME);
		await page.type('input[name="pswd"]', process.env.IDEALWINE_PASSWORD);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		await page.click('input[type="submit"]');
		await page.waitForNavigation({
			waitUntil: 'networkidle2',
			timeout: 5000,
		});
		const cookies = await page.cookies();
		if (cookies && cookies.length > 0) {
			localCache.cookies = JSON.stringify(await page.cookies());
		}
		return {};
	},
	async function getData(context: BrowserContext) {
		const {
			page,
			params: { oracleName },
			productData: { id: oracleId, url },
		} = context;
		await page.goto(
			url ?? `https://www.idealwine.com/fr/acheter-vin/${oracleId}-.jsp`,
			{
				waitUntil: 'networkidle2',
			}
		);
		const dataset: any = await page.evaluate(
			'myChart.config._config.data.datasets[0].data'
		);
		const labels: any = await page.evaluate(
			'myChart.config._config.data.labels'
		);
		if (!dataset || !labels) return {};
		const timeseries = postProcessData({ dataset, labels }, context);
		return timeseries ? { max: timeseries } : {};
	},
	async function handleFailure(
		context: BrowserContext,
		result: CrawlingResult
	) {
		if (!result || Object.keys(result).length === 0) {
			const screenshotUrl = await takeScreenshot(context);
			console.log('screenshotUrl', screenshotUrl);
		}
		return result;
	},
];
