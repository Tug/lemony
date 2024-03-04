// This lambda requires a layer with libreoffice:
// https://github.com/shelfio/libreoffice-lambda-layer

const { createReadStream, existsSync, lstatSync, writeFile } = require('fs');
const path = require('path');
const { promisify } = require('util');
const tar = require('tar');
const { spawn } = require('child_process');
const zlib = require('minizlib');
const AWS = require('aws-sdk');

const bucket = 'diversified-docs';
const region = 'eu-west-3';
const libreOfficeInstallDir = '/tmp/instdir';

AWS.config.update({ region });

const loadLibreOffice = async () => {
	if (
		existsSync(libreOfficeInstallDir) &&
		lstatSync(libreOfficeInstallDir).isDirectory()
	) {
		console.log(
			'We have a cached copy of LibreOffice, skipping extraction'
		);
	} else {
		console.log(
			'No cached copy of LibreOffice, extracting tar stream from Brotli file.'
		);
		await new Promise((resolve, reject) => {
			const stream = createReadStream('/opt/lo.tar.br')
				.pipe(new zlib.BrotliDecompress())
				.pipe(
					tar.extract({
						cwd: '/tmp',
					})
				);

			stream.on('error', reject);
			stream.on('end', resolve);
		});
		console.log('Done caching LibreOffice!');
	}
	return `${libreOfficeInstallDir}/program/soffice.bin`;
};

const downloadFromS3 = async (key, downloadPath) => {
	const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
	const file = await s3
		.getObject({
			Bucket: bucket,
			Key: key,
		})
		.promise();
	await promisify(writeFile)(downloadPath, file.Body);
};

const uploadToS3 = async (filePath, key) => {
	const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
	return await s3.upload({
		Bucket: bucket,
		Key: key,
		Body: createReadStream(filePath),
	});
};

const convertWordToPdf = async (sofficePath, wordFilePath, outputDir) => {
	const convCmd = `${sofficePath} --headless --norestore --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --convert-to pdf:writer_pdf_Export --outdir ${outputDir} ${wordFilePath}`;
	const child = spawn(convCmd, { shell: true });
	const stdoutChunks = [];
	const stderrChunks = [];
	for await (const chunk of child.stdout) {
		stdoutChunks.push(chunk);
	}
	for await (const chunk of child.stderr) {
		stderrChunks.push(chunk);
	}
	const stdout = Buffer.concat(stdoutChunks).toString();
	const stderr = Buffer.concat(stderrChunks).toString();
	if (child.exitCode !== 0) {
		console.error(
			`Failed to convert the document. Exit code: ${child.exitCode}.`
		);
		console.error(stderr);
		return false;
	}
	return true;
};

exports.handler = async (event, context) => {
	const projectSlug = 'project';
	const key = `legal/token-terms/${projectSlug}.docx`;
	const keyPrefix = path.dirname(key);
	const baseName = path.basename(key);
	const filePrefix = path.parse(baseName).name;
	const destinationPath = `${keyPrefix}/${filePrefix}.pdf`;
	const downloadPath = `/tmp/${baseName}`;
	const outputDir = '/tmp';

	await downloadFromS3(key, downloadPath);
	const sofficePath = loadLibreOffice();
	const isConverted = convertWordToPdf(sofficePath, downloadPath, outputDir);
	if (isConverted) {
		const fileName = path.basename(destinationPath, '.pdf');
		await uploadToS3(`${outputDir}/${fileName}.pdf`, destinationPath);
		return {
			response: `https://${bucket}.s3.${region}.amazonaws.com/${destinationPath}`,
		};
	}
	throw new Error('Cannot convert this document to PDF');
};
