import './script-setup';
import prisma from '../src/lib/prismadb';
import { hideBin } from 'yargs/helpers';
import refreshPrice from '../src/lib/price/sync';

export default async function recrawl({ productId }: { productId: string }) {
	if (!productId) {
		throw new Error('Product Id missing');
	}
	const product = await prisma.productInInventory.findUniqueOrThrow({
		where: { id: productId },
		include: {
			oracleProducts: {
				include: {
					oracle: true,
				},
			},
		},
	});
	const result = {};
	for (const oracleProduct of product.oracleProducts) {
		result[oracleProduct.id] = await refreshPrice(oracleProduct);
	}
	console.log('Final result', result);
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).option('productId', {
		type: 'string',
		description: 'The product id to recrawl',
	}).argv;
	recrawl(args);
}
