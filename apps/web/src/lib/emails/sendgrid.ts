import { UserWithWallets } from '../prismadb';
import sendgridApiClient from '@sendgrid/mail';
import type { AttachmentData } from '@sendgrid/helpers/classes/attachment';

function getSendgridClient() {
	sendgridApiClient.setApiKey(process.env.SENDGRID_API_KEY);
	return sendgridApiClient;
}

export type TemplateId =
	| 'WELCOME'
	| 'ACCOUNT_CREDITED_CB'
	| 'ACCOUNT_CREDITED_SEPA'
	| 'ORDER_SUCCESS'
	| 'FREE_CREDITS_RECEIVED_SPONSOR'
	| 'FREE_CREDITS_RECEIVED_REFERRAL'
	| 'LOGIN_WITH_EMAIL'
	| 'LOGIN_WITH_EMAIL_TWILIO'
	| 'PREORDER_SUCCESS'
	| 'PREORDER_REFUND'
	| 'ORDER_REFUND'
	| 'ORDER_REFUND_MAZIS';

const templateIds: {
	[locale: string]: { [templateId in TemplateId]?: string };
} = {
	en: {
		WELCOME: 'd-7880e0d460fd45698a9b09bdf1209346',
		ACCOUNT_CREDITED_SEPA: 'd-72465c33ab13439582592b044378528d',
		// ACCOUNT_CREDITED_CB: 'd-846b4d9c9eb14df78409d702483072be',
		ORDER_SUCCESS: 'd-1482c2cb90e44f14af89737937837c02',
		FREE_CREDITS_RECEIVED_SPONSOR: 'd-cd8bfc3104534cfea71a16ab571cb46e',
		FREE_CREDITS_RECEIVED_REFERRAL: 'd-7aa926fbdde641349e083bf7335bbb91',
		LOGIN_WITH_EMAIL: 'd-960eb89211da49dba801de636dfa673f',
		LOGIN_WITH_EMAIL_TWILIO: 'd-940917d7d0e64177807e2249529bb2db',
		PREORDER_SUCCESS: 'd-338d7a3f06c6401198f737707f09a9f0',
		PREORDER_REFUND: 'd-fb6b1f6b77b042368c412c9e8535ad39',
		ORDER_REFUND: 'd-b5700ba037a74a41a5e1c404ffaa8b97',
		ORDER_REFUND_MAZIS: 'd-b3477dbd219a479d835e83b7e95e4599',
	},
	fr: {
		WELCOME: 'd-f8bfd00319f54de5bcb6a2f34e97b101',
		ACCOUNT_CREDITED_SEPA: 'd-def77dba7eea454c8d6c0843ed5df64f',
		ORDER_SUCCESS: 'd-fc05357301d541ba8bcce9c5b08fd1f7',
		FREE_CREDITS_RECEIVED_SPONSOR: 'd-cfc36802e6d24c8c8b24055b4dd9289a',
		FREE_CREDITS_RECEIVED_REFERRAL: 'd-101308779e894cb7a5021204520a71fe',
		LOGIN_WITH_EMAIL: 'd-e7edc64da142497983879f4dc4fda91b',
		LOGIN_WITH_EMAIL_TWILIO: 'd-5b8339eb4e014fa89bfb4d382d70733f',
		PREORDER_SUCCESS: 'd-f040826029414c45b1c9d1d8aea4b803',
		PREORDER_REFUND: 'd-8468c70f573b4b949278c4716caa47ce',
		ORDER_REFUND: 'd-5f3895e9f3b14f538f4e89f4ef0b151e',
		ORDER_REFUND_MAZIS: 'd-c3e231add34e4ad5870e8e1da4964a1f',
	},
};

export const getTemplateId = (template: TemplateId, locale: string = 'en') =>
	templateIds[locale]?.[template] ?? templateIds.en[template];

const globalVars = {
	current_year: new Date().getFullYear().toString(),
	company: 'Diversified Finance',
	contact_email: 'contact@diversified.fi',
};

export async function sendEmailWithTemplate({
	to,
	template,
	locale = 'en',
	customVars = {},
	attachments,
}: {
	to:
		| string
		| { email: string; name: string }
		| string[]
		| Array<{ email: string; name: string }>;
	template: TemplateId;
	locale: string;
	customVars?: any;
	attachments?: AttachmentData[];
}) {
	const templateId =
		templateIds[locale]?.[template] ?? templateIds.en[template];
	const message = {
		template_id: templateId,
		from: {
			email: 'hello@diversified.fi',
			name: 'Diversified Finance',
		},
		personalizations: [
			{
				to,
				dynamic_template_data: {
					...globalVars,
					email: Array.isArray(to)
						? to[0]?.email ?? to[0]
						: to?.email ?? to,
					...customVars,
				},
			},
		],
		attachments,
	};
	const sendgrid = getSendgridClient();
	return sendgrid.send(message);
}

export async function sendEmailToUserWithTemplate({
	template,
	user,
	customVars = {},
	attachments,
}: {
	template: TemplateId;
	user: UserWithWallets;
	customVars?: any;
	attachments?: AttachmentData[];
}) {
	if (!user.email) {
		console.error(
			'Cannot send email: User does not have a registered email.'
		);
		return;
	}
	return await sendEmailWithTemplate({
		to: user.email,
		template,
		locale: user.locale ?? 'en',
		customVars: {
			...globalVars,
			first_name: user.firstName,
			last_name: user.lastName,
			name: `${user.firstName} ${user.lastName}`.trim(),
			...customVars,
		},
		attachments,
	});
}

export async function sendSimpleEmail(
	message: string,
	subject: string = 'Diversified System Event',
	to: string | { email: string; name: string } = 'contact@diversified.fi',
	from: string | { email: string; name: string } = {
		email: 'system@diversified.fi',
		name: 'Diversified Finance System',
	},
	extra: any = {}
) {
	const sendgrid = getSendgridClient();
	return sendgrid.send({
		to,
		subject,
		from,
		content: [
			{
				type: 'text/plain',
				value: message,
			},
			{
				type: 'text/html',
				value: (message || '')
					.split('\n')
					.map((paragraph) => `<p>${paragraph}</p>`)
					.join(''),
			},
		],
		...extra,
	});
}
