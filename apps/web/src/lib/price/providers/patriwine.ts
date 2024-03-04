import { BrowserContext, Capability, CrawlingResult, Step } from '../types';
import { takeScreenshot } from '../common/capabilities/browser';

const localCache = {};

export const capabilities: Capability[] = ['browser'];

const patriwinePeriods = ['max'] as const;
export type PatriwinePeriodsType = (typeof patriwinePeriods)[number];
export const minPeriod: PatriwinePeriodsType = 'max';

function parseLocalizedNumber(value, locales: string | string[] = 'fr') {
	const example = Intl.NumberFormat(locales).format('1.1');
	const cleanPattern = new RegExp(`[^-+0-9${example.charAt(1)}]`, 'g');
	const cleaned = value.replace(cleanPattern, '');
	const normalized = cleaned.replace(example.charAt(1), '.');

	return parseFloat(normalized);
}

async function ensureNoModal({ page }: BrowserContext) {
	await page.evaluate(() => {
		window.mpmFreeCallModule = {};
	});
	if (Boolean(await page.$('#adultcontentOK'))) {
		await page.click('#adultcontentOK');
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
}

export const steps: Step<BrowserContext>[] = [
	async function login(context: BrowserContext) {
		const { page } = context;
		if (localCache.cookies) {
			try {
				await page.setCookie(...JSON.parse(localCache.cookies));
			} catch (err) {
				// ignore error
			}
		}
		await page.setCookie({
			name: 'DELUXEADULTCONTENTWarningCheck',
			value: 'accepted',
			domain: '.www.patriwine.fr',
			path: '/',
			secure: false,
			httpOnly: false,
			sameSite: 'None',
			expires: Math.round(Date.now() / 1000) + 3600 * 24 * 365,
		});
		await page.goto('https://www.patriwine.fr/fr/mon-compte', {
			waitUntil: 'networkidle2',
		});
		await ensureNoModal(context);
		const accountHeader = await page.evaluate(() => {
			const header = document.querySelector('.page-heading');
			return header ? header.innerText.trim() : '';
		});
		if (accountHeader === 'Mon compte') {
			// Already logged in
			return {};
		}
		if (
			Boolean(await page.$('#email')) &&
			Boolean(await page.$('#passwd'))
		) {
			await page.$eval(
				'#email',
				(el, username) => (el.value = username),
				process.env.PATRIWINE_USERNAME
			);
			await page.$eval(
				'#passwd',
				(el, password) => (el.value = password),
				process.env.PATRIWINE_PASSWORD
			);
			await page.click('#SubmitLogin');
			await page.waitForNavigation({
				waitUntil: 'networkidle2',
			});
			const cookies = await page.cookies();
			if (cookies && cookies.length > 0) {
				localCache.cookies = JSON.stringify(await page.cookies());
			}
		}
		return {};
	},
	async function fetchData(context: BrowserContext) {
		const {
			page,
			params,
			productData: {
				wine,
				purchaseDate,
				estimateColumnName = 'Cours estimé / Bt',
				purchaseDateColumnName = "Date d'achat",
				numberLocale = 'fr',
			},
		} = context;
		let oracleId = params?.oracleId;
		if (!oracleId) {
			oracleId = wine;
		}
		await page.goto(`https://www.patriwine.fr/fr/ma-cave`, {
			waitUntil: 'networkidle2',
		});
		await ensureNoModal(context);
		// Too lazy to get cookies and serialize it for fetch
		// Let's use puppeteer instead since we have it loaded
		const results: CrawlingResult = {};
		try {
			const tableTitle = await page.evaluate(
				() => document.querySelector('.table-title').innerText
			);
			const estimateDateString = tableTitle.match(
				/(\d{2})\/(\d{2})\/(\d{4})/
			)?.[0]; // dd/mm/yyyy format
			const dateParts = estimateDateString.split('/');
			const estimateDate = new Date(
				+dateParts[2],
				dateParts[1] - 1,
				+dateParts[0]
			);
			const estimateColumnIndex = await page.evaluate(
				(columnName: string) => {
					const col = document
						.evaluate(
							`//table/thead/tr/th[contains(., ${JSON.stringify(
								columnName
							)})]`,
							document,
							null,
							XPathResult.ANY_TYPE,
							null
						)
						.iterateNext();
					const colIndex = [...col.parentElement.children].indexOf(
						col
					);
					return colIndex ?? 4;
				},
				estimateColumnName
			);
			if (estimateColumnIndex < 0) {
				throw new Error('Could not find row index');
			}
			const purchaseDateColumnIndex = await page.evaluate(
				(columnName) => {
					const puchaseDateHeaderCell = document
						.evaluate(
							`//table/thead/tr/th[contains(., ${JSON.stringify(
								columnName
							)})]`,
							document,
							null,
							XPathResult.ANY_TYPE,
							null
						)
						.iterateNext();
					const colIndex = [
						...puchaseDateHeaderCell.parentElement.children,
					].indexOf(puchaseDateHeaderCell);
					return colIndex ?? 2;
				},
				purchaseDateColumnName
			);
			const estimateRowIndex = await page.evaluate(
				(productName, atDate, atDateColumnIndex) => {
					const xPathResult = document.evaluate(
						`//table/tbody/tr/td[contains(., ${JSON.stringify(
							productName
						)})]`,
						document,
						null,
						XPathResult.ANY_TYPE,
						null
					);
					// iterate over xPathResult
					while (true) {
						const productNameCell = xPathResult.iterateNext();
						if (!productNameCell) {
							break;
						}
						const row = productNameCell.parentElement;
						const purchaseDateValue = Array.from(row.children)[
							atDateColumnIndex
						].innerText.trim();
						if (purchaseDateValue === atDate) {
							const rowIndex = [
								...row.parentElement.children,
							].indexOf(row);
							return rowIndex;
						}
					}
					return -1;
				},
				oracleId,
				purchaseDate,
				purchaseDateColumnIndex
			);
			if (estimateRowIndex < 0) {
				throw new Error('Could not find estimate row index');
			}
			const cellValue = await page.evaluate(
				(rowIndex, columnIndex) => {
					const tBody = document
						.evaluate(
							'//table/tbody',
							document,
							null,
							XPathResult.ANY_TYPE,
							null
						)
						.iterateNext();
					const cell = Array.from(
						Array.from(tBody.children)[rowIndex]
					).children[columnIndex];
					return cell?.innerText;
				},
				estimateRowIndex,
				estimateColumnIndex
			);
			const price = parseLocalizedNumber(cellValue, numberLocale);
			if (price) {
				results.max = [[estimateDate.getTime(), { mean: price }]];
			}
		} catch (err) {
			console.error(err);
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
