// TODO this library takes more than one third of the time required by hasura-auth to load
import Email from 'email-templates';
import fs from 'fs';
import nodemailer from 'nodemailer';
import nodemailerSendgrid from 'nodemailer-sendgrid';
import path from 'path';

type TemplateEngineProps = {
	content: string;
	variables: {
		[key: string]: string;
	};
};

const templateEngine = ({ content, variables }: TemplateEngineProps) => {
	let templatedContent = content;

	for (const key in variables) {
		const regex = new RegExp(`\\\${${key}}`, 'g');
		templatedContent = templatedContent.replace(regex, variables[key]);
	}

	return templatedContent;
};

type EmailField = 'subject' | 'html' | 'text';
type SmsField = 'text';

const convertFieldToFileName = (field: EmailField | SmsField) => {
	if (field === 'subject') {
		return 'subject.txt';
	}

	if (field === 'html') {
		return 'body.html';
	}

	if (field === 'text') {
		return 'body.txt';
	}

	return null;
};

const getFileName = (view: string, locals: Record<string, string>) => {
	// generate path to template
	const viewSplit = view.split('/');
	const id = viewSplit[0];
	const field = viewSplit[1] as EmailField | SmsField;
	const { locale } = locals;
	const fileName = convertFieldToFileName(field);
	return `${locale}/${id}/${fileName}`;
};

const readFile = (view: string, locals: Record<string, string>): string => {
	const { locale } = locals;
	const fullPath = path.join(
		process.env.PWD,
		'emails/templates',
		getFileName(view, locals)
	);
	try {
		return fs.readFileSync(fullPath).toString();
	} catch (error) {
		if (locale !== process.env.AUTH_LOCALE_DEFAULT) {
			return readFile(view, {
				...locals,
				locale: process.env.AUTH_LOCALE_DEFAULT,
			});
		}
		throw Error();
	}
};

type CommonLocals = {
	displayName: string;
	locale: string;
};

export type SmsLocals = CommonLocals & {
	code: string;
};

export type EmailLocals = CommonLocals & {
	link: string;
	email: string;
	newEmail: string;
	ticket: string;
	redirectTo: string;
	serverUrl: string;
	clientUrl: string;
};

const renderTemplate = async (
	view: string,
	locals: EmailLocals | SmsLocals
) => {
	try {
		const content = readFile(view, locals);
		return templateEngine({ content, variables: locals });
	} catch (error) {
		return null;
	}
};

/**
 * SMTP transport.
 */
const transport = nodemailer.createTransport(
	process.env.SENDGRID_API_KEY
		? nodemailerSendgrid({
				apiKey: process.env.SENDGRID_API_KEY,
		  })
		: {
				host: process.env.AUTH_SMTP_HOST,
				port: Number(process.env.AUTH_SMTP_PORT),
				secure: Boolean(process.env.AUTH_SMTP_SECURE),
				auth: {
					pass: process.env.AUTH_SMTP_PASS,
					user: process.env.AUTH_SMTP_USER,
				},
				authMethod: process.env.AUTH_SMTP_AUTH_METHOD,
		  }
);

/**
 * Reusable email client.
 */
export const emailClient = new Email<EmailLocals>({
	transport,
	message: { from: process.env.AUTH_SMTP_SENDER },
	send: Boolean(process.env.SEND_EMAIL),
	preview: !Boolean(process.env.SEND_EMAIL),
	render: renderTemplate,
});
