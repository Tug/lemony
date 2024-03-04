const https = require('https');
const http = require('http');

const simpleFetch = (url, options) => {
	const httpModule = url.startsWith('https') ? https : http;
	return new Promise((resolve, reject) => {
		const req = httpModule.get(url, options, (res) => {
			if (res.statusCode < 200 || res.statusCode >= 300) {
				return reject(new Error(`HTTP Error ${res.statusCode}`));
			}
			const responseData = [];
			res.on('data', (chunk) => {
				responseData.push(chunk);
			});
			res.on('end', () => {
				try {
					resolve(JSON.parse(Buffer.concat(responseData).toString()));
				} catch (error) {
					reject(error);
				}
			});
		});
		req.on('error', (error) => {
			reject(error);
		});
		req.end();
	});
};

const apiFetch = (path) => {
	return simpleFetch(`${process.env.NEXT_API_URL}${path}`, {
		headers: { Authorization: `Bearer ${process.env.API_SECRET_KEY}` },
	})
		.then((json) => {
			console.log(`GET ${path} OK`);
			if (process.env.NODE_ENV === 'development') {
				console.log(json);
			}
			return json;
		})
		.catch((err) => {
			console.error(`GET ${path} ERROR`);
			// if (process.env.NODE_ENV === 'development') {
			throw err;
			// }
		});
};

async function callEndpoints(endpoints) {
	endpoints = Array.isArray(endpoints) ? endpoints : [endpoints];
	for (const endpoint of endpoints) {
		try {
			await apiFetch(endpoint);
		} catch (err) {
			console.error(err);
		}
	}
}

module.exports.every10s = (event, context, callback) => {
	const jobs = [
		'/jobs/process-payments',
		// cold boot mangopay hook url
		'/payment/mangopay/payload?RessourceId=SYSTEM_BOOT&EventType=&Date=',
		// TODO NEXT: cold boot /payment-redirect
	];

	callEndpoints(jobs);
};

module.exports.everyMinute = (event, context, callback) => {
	const minuteJobs = [
		'/jobs/check-user-labels',
		'/jobs/process-orders',
		'/jobs/send-pending-notifications',
	];

	callEndpoints(minuteJobs);
};

module.exports.every20Minutes = (event, context, callback) => {
	const twentyMinutesjobs = [
		'/jobs/payout-projects',
		'/jobs/sync-users',
		'/jobs/process-refunds',
	];

	(async () => {
		await callEndpoints(twentyMinutesjobs);
		await applyUserBenefits();
		await syncProjects();
	})();
};

module.exports.everyDayAt5am = (event, context, callback) => {
	(async () => {
		await callEndpoints([
			'/jobs/backup-database',
			'/jobs/check-user-credits',
			'/jobs/check-mangopay-hooks',
			'/jobs/delete-expired-token-claims',
			'/jobs/sync-orders',
		]);
		if (new Date().getDay() === 1) {
			// on mondays only
			await callEndpoints(['/jobs/delete-disabled-users']);
		}
		await updateAllPrices();
	})();
};

async function syncProjects(syncAll = false) {
	let allProjects = [];
	try {
		await apiFetch(`/jobs/sync-products`);
		let page = 1;
		while (true) {
			const { projects } = await apiFetch(
				`/jobs/sync-projects?page=${page}&per_page=1`
			);
			if (!projects || projects.length === 0) {
				break;
			}
			const projectsSynced = projects.filter(Boolean);
			console.log(`+${projectsSynced.length} projects synced.`);
			if (!syncAll && projectsSynced.length === 0) {
				break;
			}
			allProjects = [...allProjects, ...projectsSynced];
			page++;
		}
	} catch (err) {
		console.error(`Error syncing projects:`, err);
	}
	console.log(`Total: ${allProjects.length} projects synced.`);
	return allProjects;
}

async function updateAllPrices() {
	// TODO: iterate over all projects
	// TODO: be smarter about updating prices
	const { projects: allProjects } = await apiFetch(
		`/feed/projects?per_page=100`
	);
	const productIds = Array.from(
		new Set(
			allProjects
				.map(({ products }) =>
					(products ?? []).map(({ productId }) => productId)
				)
				.flat()
		)
	);

	console.log(`Syncing prices for ${productIds.length} products`);
	for (const productId of productIds) {
		try {
			console.log(`Syncing ${productId}...`);
			const { crawling_result } = await apiFetch(
				`/jobs/sync-prices?productId=${productId}`
			);
			console.log(`Updated prices for ${productId}`);
			console.log('Result prices', crawling_result);
			await new Promise((resolve) => setTimeout(resolve, 5000));
		} catch (err) {
			console.error(`Error syncing price:`, err);
		}
	}
	await apiFetch(`/jobs/sync-project-prices`);
}

async function applyUserBenefits() {
	let cursor = '';
	try {
		do {
			const { cursor: nextCursor, userCount } = await apiFetch(
				`/jobs/apply-user-benefits?cursor=${cursor}`
			);
			cursor = nextCursor;
			console.log(`Applied benefits to ${userCount} users.`);
		} while (cursor);
	} catch (err) {
		console.error(`Error applying user benefits:`, err);
	}
}

if (require.main === module) {
	(async () => {
		await syncProjects();
		await updateAllPrices();
	})();
}
