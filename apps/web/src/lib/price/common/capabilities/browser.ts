import type { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import AnonymizeUAPlugin from 'puppeteer-extra-plugin-anonymize-ua';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Context } from '../../types';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import fs from 'fs';

// https://github.com/vercel/pkg/issues/910#issuecomment-1374872029
require('puppeteer-extra-plugin-stealth/evasions/chrome.app');
require('puppeteer-extra-plugin-stealth/evasions/chrome.csi');
require('puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes');
require('puppeteer-extra-plugin-stealth/evasions/chrome.runtime');
require('puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow');
require('puppeteer-extra-plugin-stealth/evasions/media.codecs');
require('puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency');
require('puppeteer-extra-plugin-stealth/evasions/navigator.languages');
require('puppeteer-extra-plugin-stealth/evasions/navigator.permissions');
require('puppeteer-extra-plugin-stealth/evasions/navigator.plugins');
require('puppeteer-extra-plugin-stealth/evasions/navigator.vendor');
require('puppeteer-extra-plugin-stealth/evasions/navigator.webdriver');
require('puppeteer-extra-plugin-stealth/evasions/sourceurl');
require('puppeteer-extra-plugin-stealth/evasions/user-agent-override');
require('puppeteer-extra-plugin-stealth/evasions/webgl.vendor');
require('puppeteer-extra-plugin-stealth/evasions/window.outerdimensions');
require('puppeteer-extra-plugin-stealth/evasions/defaultArgs');
require('puppeteer-extra-plugin-user-preferences');
require('puppeteer-extra-plugin-user-data-dir');

puppeteer.use(AnonymizeUAPlugin());
puppeteer.use(StealthPlugin());

async function adBlock(page: Page) {
	await page.setRequestInterception(true);

	const rejectRequestPattern = [
		'googlesyndication.com',
		'/*.doubleclick.net',
		'/*.amazon-adsystem.com',
		'/*.adnxs.com',
		'/*.criteo.com',
		'/*.adsrvr.org',
		'/*.acuityplatform.com',
		'/*.tapad.com',
		'/*.ads.linkedin.com',
		'www.facebook.com',
		// '*.siftscience.com',
		'/www.wine-searcher.com/[a-zA-Z0-9]{8}/init.js', // PerimeterX on wine-searcher.com
	];
	const blockList = [];

	page.on('request', async (request) => {
		if (
			rejectRequestPattern.find((pattern) => request.url().match(pattern))
		) {
			blockList.push(request.url());
			request.abort();
		} else {
			request.continue();
		}
	});
}

export default async function load(context: Context): Promise<void> {
	const browser =
		process.env.NODE_ENV === 'production' ||
		process.env.FEATURE_CRAWLER_FORCE_REMOTE_BROWSER
			? await puppeteer.connect({
					browserWSEndpoint: process.env
						.FEATURE_CRAWLER_USE_BROWSERLESS
						? `wss://chrome.browserless.io?token=${
								process.env.BROWSERLESS_API_TOKEN
						  }${
								process.env.FEATURE_CRAWLER_PROXY_URL
									? `&--proxy-server=${process.env.FEATURE_CRAWLER_PROXY_URL}`
									: ''
						  }${process.env.BROWSERLESS_EXTRA_ARGS ?? ''}`
						: `ws://chrome.aws.diversified.fi:3000?token=YBsbDJKUHNXEJBrwefjap7VdsiTJjq&stealth`,
			  })
			: await puppeteer.launch({
					args: [
						'--disable-infobars',
						process.env.FEATURE_CRAWLER_PROXY_URL
							? `--proxy-server=${process.env.FEATURE_CRAWLER_PROXY_URL}`
							: undefined,
					].filter(Boolean),
					executablePath:
						// eslint-disable-next-line no-nested-ternary
						process.platform === 'win32'
							? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
							: process.platform === 'linux'
							? '/usr/bin/google-chrome'
							: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
					headless: !__DEV__, // wine-searcher fails with headless browser, even with stealth
			  });
	const page = await browser.newPage();
	await page.setViewport({ width: 1200, height: 768, deviceScaleFactor: 1 });
	await adBlock(page);

	context.browser = browser;
	context.page = page;
}

export async function takeScreenshot(context: Context): Promise<string> {
	if (!context.page) {
		throw new Error('No page in context to take screenshot of');
	}
	if (process.env.NODE_ENV === 'production') {
		const screenshot = await context.page.screenshot({ fullPage: true });
		const bucketName = 'crawler-screenshots';
		const region = 'eu-west-3';
		const objectKey = `${uuidv4()}.png`;
		const s3 = new S3Client({
			region,
			credentials: {
				accessKeyId: process.env.CRAWLER_USER_AWS_ACCESS_KEY_ID ?? '',
				secretAccessKey:
					process.env.CRAWLER_USER_AWS_SECRET_ACCESS_KEY ?? '',
			},
		});
		await s3.send(
			new PutObjectCommand({
				Bucket: bucketName,
				Key: objectKey,
				Body: screenshot,
			})
		);

		return `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;
	}

	const imageId = uuidv4();
	await promisify(fs.mkdir)('./.next/cache/screenshots', { recursive: true });
	const path = `./.next/cache/screenshots/${imageId}.png`;
	await context.page.screenshot({ path, fullPage: true });

	if (__DEV__) {
		const html = await context.page.content();
		await promisify(fs.writeFile)(
			`./.next/cache/screenshots/${imageId}.html`,
			html
		);
	}

	return path;
}
