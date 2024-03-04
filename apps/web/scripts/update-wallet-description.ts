import './script-setup';
import { updateWalletDescription } from '../src/lib/project';
import prisma from '../src/lib/prismadb';

export default async function run({ projectId }: { projectId?: string }) {
	const projects = await prisma.project.findMany({
		where: {
			...(projectId && { id: projectId }),
			visibility: 'production',
		},
	});
	for (const project of projects) {
		await updateWalletDescription(project);
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv)).option('projectId', {
		type: 'string',
		description: 'Project id to update the wallet description',
	}).argv;
	run(args);
}
