import { hideBin } from 'yargs/helpers';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.CI
	? 'https://staging.app.diversified.fi/api'
	: 'http://localhost:3000/api';

export default async function run({
	slug,
	syncAll = false,
	syncPrices = false,
	force = false,
}: {
	slug: string;
	syncAll?: boolean;
	syncPrices?: boolean;
	force?: boolean;
}) {
	let allProjects = [];

	await axios.get(`${API_URL}/jobs/sync-products`, {
		headers: {
			Authorization: `Bearer ${process.env.API_SECRET_KEY}`,
		},
	});

	try {
		let page = 1;
		const perPage = 1;
		while (true) {
			const {
				data: { projects },
			} = await axios.get(
				`${API_URL}/jobs/sync-projects?page=${page}&per_page=${perPage}${
					force ? '&force=1' : ''
				}${slug ? `&slug=${slug}` : ''}`,
				{
					headers: {
						Authorization: `Bearer ${process.env.API_SECRET_KEY}`,
					},
				}
			);
			console.log(`+${projects.length} projects returned.`);
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

	if (syncPrices) {
		console.log('Syncing prices...', allProjects);
		for (const project of allProjects) {
			console.log(
				`Syncing prices for ${project.slug}...`,
				project.products
			);
			const productIds = Array.from(
				new Set(project.products.map(({ productId }) => productId))
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
		}
		await axios.get(`${API_URL}/jobs/sync-project-prices`, {
			headers: {
				Authorization: `Bearer ${process.env.API_SECRET_KEY}`,
			},
		});
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('slug', {
			type: 'string',
			description: 'Project slug to update',
		})
		.option('syncAll', {
			type: 'boolean',
			description: 'Sync all projects',
		})
		.option('syncPrices', {
			type: 'boolean',
			description: 'Sync products prices after projects sync',
		})
		.option('force', {
			type: 'boolean',
			description: 'Force project sync',
		}).argv;
	run(args);
}
