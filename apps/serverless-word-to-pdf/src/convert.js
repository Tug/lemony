const {
	convertTo,
	canBeConvertedToPDF,
} = require('@shelf/aws-lambda-libreoffice');
const AWS = require('aws-sdk');
const { promisify } = require('util');
const { writeFile, createReadStream } = require('fs');

const defaultBucket = 'diversified-docs';
const region = 'eu-west-3';

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

exports.handler = async (event) => {
	let downloadPath = '';
	if (event.body) {
		const { filename, data, encoding, dstKey, dstBucket, exist } =
			JSON.parse(event.body);
		const destinationBucket = dstBucket ?? defaultBucket;
		if (dstKey || exist) {
			if (!dstKey) {
				return {
					statusCode: 400,
					headers: {
						ContentType: 'application/json',
					},
					body: {
						error: 'dstKey param missing',
					},
				};
			}
			try {
				// check if file already exists
				await s3
					.headObject({
						Bucket: destinationBucket,
						Key: dstKey,
					})
					.promise();
				return {
					statusCode: 200,
					headers: {
						ContentType: 'application/json',
					},
					body: {
						url: getUnsignedUrl({
							Bucket: destinationBucket,
							Key: dstKey,
						}),
					},
				};
			} catch (err) {
				if (exist) {
					return {
						statusCode: 404,
						headers: {
							ContentType: 'application/json',
						},
						body: {
							error: 'file does not exist',
						},
					};
				}
			}
		}

		downloadPath = `/tmp/${filename}`;
		await promisify(writeFile)(
			downloadPath,
			Buffer.from(data, encoding ?? 'base64')
		);
		const pdfFilePath = convertTo(filename, 'pdf');
		const convertedFileStream = createReadStream(pdfFilePath);

		if (dstKey) {
			await s3
				.putObject({
					Bucket: destinationBucket,
					Key: dstKey,
					Body: convertedFileStream,
					ContentType: 'application/pdf',
				})
				.promise();

			return {
				statusCode: 200,
				headers: {
					ContentType: 'application/json',
				},
				body: {
					url: getUnsignedUrl({
						Bucket: destinationBucket,
						Key: dstKey,
					}),
				},
			};
		}

		const buffer = await new Promise((resolve, reject) => {
			const chunks = [];
			convertedFileStream.on('data', function (chunk) {
				chunks.push(chunk);
			});
			convertedFileStream.on('end', function () {
				resolve(Buffer.concat(chunks));
			});
			convertedFileStream.on('error', reject);
		});

		return {
			statusCode: 200,
			isBase64Encoded: true,
			headers: {
				ContentType: 'application/pdf',
			},
			body: buffer.toString('base64'),
		};
	}
	const { srcBucket, srcKey, dstBucket, dstKey } = getLambaParams(event);
	downloadPath = `/tmp/${srcKey}`;
	// it is optional to invoke this function, you can skip it if you're sure about file format
	if (!canBeConvertedToPDF(srcKey)) {
		return false;
	}
	const file = await s3
		.getObject({ Bucket: srcBucket, Key: srcKey })
		.promise();
	await promisify(writeFile)(downloadPath, file.Body);
	const pdfFilePath = convertTo(srcKey, 'pdf');
	const convertedFileStream = createReadStream(pdfFilePath);

	await s3
		.putObject({
			Bucket: dstBucket,
			Key: dstKey,
			Body: convertedFileStream,
			ContentType: 'application/pdf',
		})
		.promise();

	return {
		statusCode: 200,
		body: JSON.stringify({ dstKey, dstBucket }),
	};
};

function getUnsignedUrl(params) {
	return `https://${params.Bucket}.s3.${
		params.region ?? region
	}.amazonaws.com/${params.Key}`;
}

function getLambaParams(event) {
	if (/* our AWS Step Function */ event.source_bucket) {
		return {
			isStep: true,
			isSQS: false,
			srcBucket: event.source_bucket,
			srcKey: event.source_key,
			dstBucket: event.target_bucket,
			dstKey: event.target_key,
		};
	} else if (
		/* Lambda S3 trigger */ event.Records &&
		event.Records[0].eventSource === 'aws:s3'
	) {
		const srcKey = decodeURIComponent(
			event.Records[0].s3.object.key.replace(/\+/g, ' ')
		);
		const srcBucket = event.Records[0].s3.bucket.name;
		return {
			isStep: false,
			isSQS: false,
			srcBucket,
			srcKey,
			dstBucket: process.env.S3_BUCKET_OUTPUT ?? srcBucket,
			dstKey: `${srcKey}.pdf`,
		};
	} else if (
		/* SQS trigger */ event.Records &&
		event.Records[0].eventSource === 'aws:sqs'
	) {
		return {
			isStep: false,
			isSQS: true,
			srcBucket: event.Records[0].source_bucket,
			srcKey: event.Records[0].source_key,
			dstBucket: event.Records[0].target_bucket,
			dstKey: event.Records[0].target_key,
		};
	}
	throw new Error('Unexpected invocation');
}
