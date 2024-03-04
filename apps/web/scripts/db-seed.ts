// Error.stackTraceLimit = Infinity;
import './script-setup';
const { PrismaClient } = require('@prisma/client');
const getCountryList =
	require('@diversifiedfinance/design-system/country-code-picker/country-code-data').getCountryList;
const createSystemUsers = require('./create-system-users').default;

// import { PrismaClient } from '@prisma/client';
// import { getCountryList } from '@diversifiedfinance/design-system/country-code-picker/country-code-data';
// import createSystemUsers from './create-system-users';

const prisma = new PrismaClient();

async function populateCountries() {
	console.log('Populating Country table.');
	await prisma.country.createMany({
		data: getCountryList((key) => key).map(
			({ code, name }: { code: string; name: string }) => ({
				code,
				name,
			})
		),
		skipDuplicates: true,
	});
	console.log('Country table populated!');
}

(async function main() {
	await populateCountries();
	try {
		await createSystemUsers();
	} catch (err) {
		// creating mangopay system users will (and should) fail
		// locally unless we use the right API key
	}
	await createSystemUsers({ useSandbox: true });
})();

export {};
