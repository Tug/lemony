import type {
	Applicant,
	CreateAccessTokenResponse,
	CreateApplicantResponse,
	GetApplicantResponse,
	GetApplicantStatusResponseAPI,
	GetApplicantStatusResponseSDK,
	NewApplicant,
} from '@sumsub/api-types';
import assert from 'assert';
import axios from 'axios';
import crypto from 'crypto';
import FormData from 'form-data';
import { DocSetType } from '@sumsub/api-types';

const SUMSUB_BASE_URL = 'https://api.sumsub.com';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(createSignature, function (error) {
	return Promise.reject(error);
});

// This function creates signature for the request as described here: https://developers.sumsub.com/api-reference/#app-tokens
function createSignature(config: any) {
	assert(
		process.env.SUMSUB_SECRET_KEY,
		'SUMSUB_SECRET_KEY env variable missing'
	);
	const ts = Math.floor(Date.now() / 1000);
	const signature = crypto.createHmac(
		'sha256',
		process.env.SUMSUB_SECRET_KEY
	);
	signature.update(ts + config.method.toUpperCase() + config.url);

	if (config.data instanceof FormData) {
		signature.update(config.data.getBuffer());
	} else if (config.data) {
		signature.update(config.data);
	}

	config.headers['X-App-Access-Ts'] = ts;
	config.headers['X-App-Access-Sig'] = signature.digest('hex');

	return config;
}

export function verifyWebhookPostData(
	rawBody: string,
	signature: string,
	hashAlgorithm: string = 'sha1',
	digestEncoding: crypto.BinaryToTextEncoding = 'hex'
) {
	assert(
		process.env.SUMSUB_WEBHOOK_SECRET_KEY,
		'SUMSUB_WEBHOOK_SECRET_KEY env variable missing'
	);

	const calculatedDigest = crypto
		.createHmac(hashAlgorithm, process.env.SUMSUB_WEBHOOK_SECRET_KEY)
		.update(rawBody)
		.digest(digestEncoding);

	if (calculatedDigest !== signature) {
		throw new Error(`Webhook sender not verified`);
	}
}

// These functions configure requests for specified method
// https://developers.sumsub.com/api-reference/#creating-an-applicant
export async function createApplicant(
	applicantData: NewApplicant,
	levelName: string = 'basic-kyc-level'
): Promise<CreateApplicantResponse> {
	assert(
		process.env.SUMSUB_APP_TOKEN,
		'SUMSUB_APP_TOKEN env variable missing'
	);
	const { data } = await axiosInstance({
		baseURL: SUMSUB_BASE_URL,
		method: 'post',
		url: `/resources/applicants?levelName=${levelName}`,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'X-App-Token': process.env.SUMSUB_APP_TOKEN,
		},
		data: JSON.stringify(applicantData),
	});
	return data;
}

export async function getApplicant(applicantId: string): Promise<Applicant> {
	assert(
		process.env.SUMSUB_APP_TOKEN,
		'SUMSUB_APP_TOKEN env variable missing'
	);
	const { data } = await axiosInstance({
		baseURL: SUMSUB_BASE_URL,
		method: 'get',
		url: `/resources/applicants/${applicantId}/one`,
		headers: {
			Accept: 'application/json',
			'X-App-Token': process.env.SUMSUB_APP_TOKEN,
		},
	});
	return data;
}

export async function getApplicantStatusAPI(
	applicantId: string
): Promise<GetApplicantStatusResponseAPI> {
	assert(
		process.env.SUMSUB_APP_TOKEN,
		'SUMSUB_APP_TOKEN env variable missing'
	);
	const { data } = await axiosInstance({
		baseURL: SUMSUB_BASE_URL,
		method: 'get',
		url: `/resources/applicants/${applicantId}/requiredIdDocsStatus`,
		headers: {
			Accept: 'application/json',
			'X-App-Token': process.env.SUMSUB_APP_TOKEN,
		},
	});
	return data;
}

async function getDocumentImage(
	inspectionId: string,
	imageId: number
): Promise<{ data: Buffer; contentType: string }> {
	assert(
		process.env.SUMSUB_APP_TOKEN,
		'SUMSUB_APP_TOKEN env variable missing'
	);
	const { data, headers } = await axiosInstance({
		baseURL: SUMSUB_BASE_URL,
		method: 'get',
		url: `/resources/inspections/${inspectionId}/resources/${imageId}`,
		// TODO nice to have: use 'stream' and pipe to mangopay request?
		responseType: 'arraybuffer',
		headers: {
			Accept: 'image/*,video/*,*/*;q=0.8',
			'X-App-Token': process.env.SUMSUB_APP_TOKEN,
		},
	});
	return { data, contentType: headers['Content-Type'] };
}

export async function getAllApplicantDocuments(
	applicantId: string,
	documentsTypes: DocSetType[] = ['IDENTITY']
): Promise<{
	documents: Array<{
		docType: DocSetType;
		images: Array<{ data: Buffer; contentType: string; imageId: number }>;
	}>;
	inspectionId: string;
}> {
	assert(
		process.env.SUMSUB_APP_TOKEN,
		'SUMSUB_APP_TOKEN env variable missing'
	);
	const applicantData = await getApplicant(applicantId);
	const applicantStatus = await getApplicantStatusAPI(applicantId);

	const documents = [];
	for (const docType of documentsTypes) {
		if (
			!applicantStatus[docType] ||
			applicantStatus[docType].reviewResult.reviewAnswer !== 'GREEN'
		) {
			throw new Error('Incomplete KYC on sumsub');
		}

		const images = [];
		for (const imageId of applicantStatus[docType].imageIds) {
			if (
				applicantStatus[docType].imageReviewResults?.[imageId] &&
				applicantStatus[docType].imageReviewResults?.[imageId]
					.reviewAnswer !== 'GREEN'
			) {
				continue;
			}

			const { data, contentType } = await getDocumentImage(
				applicantData.inspectionId,
				imageId
			);
			images.push({ data, contentType, imageId });
		}

		documents.push({
			docType,
			images,
		});
	}

	return { documents, inspectionId: applicantData.inspectionId };
}

// Warning: this endpoint does not return fixedInfo
export async function getApplicantWithExternalUserId(
	externalUserId: string
): Promise<Applicant | null> {
	assert(
		process.env.SUMSUB_APP_TOKEN,
		'SUMSUB_APP_TOKEN env variable missing'
	);
	try {
		const { data } = await axiosInstance({
			baseURL: SUMSUB_BASE_URL,
			method: 'get',
			url: `/resources/applicants/-;externalUserId=${externalUserId}/one`,
			headers: {
				Accept: 'application/json',
				'X-App-Token': process.env.SUMSUB_APP_TOKEN,
			},
		});
		return data;
	} catch (err) {
		return null;
	}
}

// https://developers.sumsub.com/api-reference/#adding-an-id-document
export async function addDocument(
	applicantId: string,
	fileName: string,
	content: Buffer,
	metadata: any
) {
	assert(
		process.env.SUMSUB_APP_TOKEN,
		'SUMSUB_APP_TOKEN env variable missing'
	);
	const form = new FormData();
	form.append('metadata', JSON.stringify(metadata));
	form.append('content', content, fileName);

	const { data } = await axiosInstance({
		baseURL: SUMSUB_BASE_URL,
		method: 'post',
		url: `/resources/applicants/${applicantId}/info/idDoc`,
		headers: Object.assign(
			{
				Accept: 'application/json',
				'X-App-Token': process.env.SUMSUB_APP_TOKEN,
			},
			form.getHeaders()
		),
		data: form,
	});
	return data;
}

// https://developers.sumsub.com/api-reference/#getting-applicant-status-sdk
export async function getApplicantStatusSDK(
	applicantId: string
): Promise<GetApplicantStatusResponseSDK> {
	assert(
		process.env.SUMSUB_APP_TOKEN,
		'SUMSUB_APP_TOKEN env variable missing'
	);
	const { data } = await axiosInstance({
		baseURL: SUMSUB_BASE_URL,
		method: 'get',
		url: `/resources/applicants/${applicantId}/status`,
		headers: {
			Accept: 'application/json',
			'X-App-Token': process.env.SUMSUB_APP_TOKEN,
		},
		data: null,
	});
	return data;
}

// https://developers.sumsub.com/api-reference/#access-tokens-for-sdks
export async function createAccessToken(
	externalUserId: string,
	levelName: string = 'basic-kyc-level',
	ttlInSecs: number = 600
): Promise<CreateAccessTokenResponse> {
	assert(
		process.env.SUMSUB_APP_TOKEN,
		'SUMSUB_APP_TOKEN env variable missing'
	);
	const { data } = await axiosInstance({
		baseURL: SUMSUB_BASE_URL,
		method: 'post',
		url: `/resources/accessTokens?userId=${encodeURIComponent(
			externalUserId
		)}&ttlInSecs=${ttlInSecs}&levelName=${levelName}`,
		headers: {
			Accept: 'application/json',
			'X-App-Token': process.env.SUMSUB_APP_TOKEN,
		},
		data: null,
	});
	return data;
}

export async function resetApplicant(applicantId: string) {
	const { data } = await axiosInstance({
		baseURL: SUMSUB_BASE_URL,
		method: 'post',
		url: `/resources/applicants/${applicantId}/reset`,
		headers: {
			Accept: 'application/json',
			'X-App-Token': process.env.SUMSUB_APP_TOKEN,
		},
		data: null,
	});
	return data?.ok;
}
