const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.CI
	? 'https://staging.app.diversified.fi/api'
	: 'http://localhost:3000/api';

(async function run() {
	let allProjects = [];

	if (process.env.SYNC_PROJECTS) {
		await axios.get(`${API_URL}/jobs/sync-products`, {
			headers: {
				Authorization: `Bearer ${process.env.API_SECRET_KEY}`,
			},
		});
		let page = 1;
		const perPage = 1;
		while (true) {
			try {
				const {
					data: { projects },
				} = await axios.get(
					`${API_URL}/jobs/sync-projects?page=${page}&per_page=${perPage.toString()}`,
					{
						headers: {
							Authorization: `Bearer ${process.env.API_SECRET_KEY}`,
						},
					}
				);
				const projectsSynced = projects.filter(Boolean);
				console.log(`+${projectsSynced.length} projects synced.`);
				if (projectsSynced.length === 0) {
					break;
				}
				allProjects = [...allProjects, ...projectsSynced];
				page++;
			} catch (err) {
				console.error(
					`Error syncing projects: ${err?.message}`,
					err.isAxiosError ? err.response?.data : ''
				);
			}
		}
	} else {
		const {
			data: { projects },
		} = await axios.get(`${API_URL}/feed/projects?per_page=100`);
		allProjects = projects ?? [];
	}

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
			const {
				data: { crawling_result },
			} = await axios.get(`${API_URL}/jobs/sync-prices`, {
				params: {
					productId,
				},
				headers: {
					Authorization: `Bearer ${process.env.API_SECRET_KEY}`,
				},
			});
			console.log(`Updated prices for ${productId}`);
			console.log('Result prices', crawling_result);
			await new Promise((resolve) => setTimeout(resolve, 5000));
		} catch (err) {
			console.error(
				`Error syncing price: ${err?.message}`,
				err.isAxiosError ? err.response?.data : ''
			);
		}
	}
	await axios.get(`${API_URL}/jobs/sync-project-prices`, {
		headers: {
			Authorization: `Bearer ${process.env.API_SECRET_KEY}`,
		},
	});
})();
