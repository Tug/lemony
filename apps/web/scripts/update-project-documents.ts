import './script-setup';
import prisma, { projectWithProductIdsIncludes } from '../src/lib/prismadb';
import { updateDocumentUrl } from '../src/lib/sync/wordpress';
import { supportedLocales } from '@diversifiedfinance/app/lib/i18n/config';
import { getI18nServerInstance } from '../src/lib/i18n';

export default async function run({
	projectId,
	templateUrl,
	all,
}: {
	projectId: string;
	templateUrl: string;
	all: boolean;
}) {
	if (!projectId && !all) {
		throw new Error('`--projectId` or `--all` must be provided');
	}
	const projects = await prisma.project.findMany({
		where: { ...(projectId && { id: projectId }) },
		include: projectWithProductIdsIncludes,
	});
	for (const project of projects) {
		console.log('Project:', project.id, project.title);
		const documentUrl = await updateDocumentUrl(project, templateUrl, true);
		console.log('Document EN:', documentUrl);
		for (const locale of supportedLocales) {
			if (locale === 'en') {
				continue;
			}
			const i18n = await getI18nServerInstance(locale);
			if (i18n.t(documentUrl) !== documentUrl) {
				console.log(
					`Document ${locale.toUpperCase()}:`,
					i18n.t(documentUrl)
				);
			}
		}
		console.log('########################');
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('projectId', {
			type: 'string',
			description: 'Id of the project to process',
		})
		.option('templateUrl', {
			type: 'string',
			description: 'Template Url',
			default: 'https://getdiversified.app/security-tokens-tc-2023.docx',
		})
		.option('all', {
			type: 'boolean',
			description: 'All projects',
		}).argv;
	run(args);
}
