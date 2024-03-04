import './script-setup';
import prisma from '../src/lib/prismadb';
import { payoutProject } from '../src/lib/payment';

export default async function run({
	projectId,
	noFees,
}: {
	projectId?: string;
	noFees: boolean;
}) {
	if (projectId) {
		await payoutProject(projectId, noFees);
		return;
	}
	const allTerminatedProjects = await prisma.$queryRaw`
		SELECT 
			p.*
		FROM 
			projects p
		INNER JOIN 
			projectcrowdfundingstate pcs ON p."crowdfundingStateId" = pcs.id
		WHERE 
			pcs."collectedAmount" >= pcs."maximumAmount" - 0.03
			AND p.paid = false
			AND p."isPresale" = false
	`;
	// for (const project of allTerminatedProjects) {
	// 	await prisma.project.update({
	// 		where: { id: project.id },
	// 		data: { paid: false },
	// 	});
	// }
	// return;
	console.log(`Processing ${allTerminatedProjects.length} projects...`);
	for (const project of allTerminatedProjects) {
		console.log('Payout for project', project.id, project.title);
		const payout = await payoutProject(project.id, noFees);
		console.log('Payout', payout.Status);
		console.log('Payout details', payout);
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('projectId', {
			type: 'string',
			description: 'Project Id to payout on',
		})
		.option('noFees', {
			type: 'boolean',
			description: 'Take Diversified fees from the project',
			default: false,
		}).argv;
	run(args);
}
