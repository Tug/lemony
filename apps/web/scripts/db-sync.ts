import './script-setup';
import { hideBin } from 'yargs/helpers';
import refreshPrice from '../src/lib/price/sync';
import { refreshProjectPrices } from '../src/lib/price/project';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import prisma from '../src/lib/prismadb';

async function run({
	syncPrices,
	syncPricesFromProduction,
}: {
	syncPrices: boolean;
	syncPricesFromProduction: boolean;
}) {
	// const wpProducts = await getWPProducts();
	// console.log(`${wpProducts.length} products retrieved.`);
	// const products = await syncProductsInDB(wpProducts ?? []);
	// console.log(`${products.length} products synced!`);
	// const wpProjects = await getAllWPEntities<WP_REST_API_Project>('project');
	// console.log(`${wpProjects.length} products retrieved.`);
	// const projects = await syncProjectsInDB(wpProjects);
	// console.log(`${projects.length} projects synced!`);
	if (syncPrices) {
		console.log(`Syncing oracle product prices...`);
		for (const product of products) {
			for (const oracleProduct of product.oracleProducts) {
				await refreshPrice(oracleProduct);
			}
		}
		console.log(`OK`);
		console.log(`Refreshing project prices...`);
		await refreshProjectPrices();
		console.log(`OK`);
	} else if (syncPricesFromProduction) {
		const productionClient = new PrismaClient({
			datasources: {
				db: {
					url: dotenv.parse(
						fs.readFileSync(
							path.join(__dirname, '../.env.production.local'),
							{
								encoding: 'utf8',
							}
						)
					).DATABASE_URL,
				},
			},
		});
		const productionOracleProducts =
			await productionClient.oracleProduct.findMany({
				select: {
					id: true,
					externalId: true,
				},
			});
		const localOracleProducts = await prisma.oracleProduct.findMany({
			select: {
				id: true,
				externalId: true,
			},
		});
		const prodToLocalOracleProductIdMapping =
			productionOracleProducts.reduce((result, oracleProduct) => {
				result[oracleProduct.id] = localOracleProducts.find(
					({ externalId }) => externalId === oracleProduct.externalId
				)?.id;
				return result;
			}, {});
		const oraclePrices = await productionClient.oraclePrice.findMany({});
		await prisma.oraclePrice.createMany({
			data: oraclePrices
				.map((oraclePrice) =>
					prodToLocalOracleProductIdMapping[
						oraclePrice.oracleProductId
					]
						? {
								...oraclePrice,
								oracleProductId:
									prodToLocalOracleProductIdMapping[
										oraclePrice.oracleProductId
									],
						  }
						: null
				)
				.filter(Boolean),
		});
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('syncPrices', {
			type: 'boolean',
			description: 'Whether to sync the prices as well',
			default: false,
		})
		.option('syncPricesFromProduction', {
			type: 'boolean',
			description: 'Sync the prices from production',
			default: false,
		}).argv;
	run(args);
}
