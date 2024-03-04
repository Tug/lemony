import './types';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMiddlewareDecorator, NextFunction } from 'next-api-decorators';
import acceptLanguage from 'accept-language';
import {
	fallback,
	supportedLocales,
} from '@diversifiedfinance/app/lib/i18n/config';
import { I18n } from '@diversifiedfinance/app/lib/i18n';
import { getI18nServerInstance } from '../../lib/i18n';
import type { NextApiRequestWithContext } from './request-with-contexts';

acceptLanguage.languages(supportedLocales);

const withTranslationMiddleware = async (
	req: NextApiRequest,
	res: NextApiResponse,
	next: NextFunction
) => {
	let lang;
	if (req.query.lang && typeof req.query.lang === 'string') {
		lang = acceptLanguage.get(req.query.lang);
	}
	if (req.body?.locale && typeof req.body.locale === 'string') {
		lang = acceptLanguage.get(req.body.locale);
	}
	if (!lang) {
		lang = acceptLanguage.get(req.headers['accept-language']);
	}
	if (!lang) {
		lang = fallback;
	}

	if (!req.context) {
		req.context = {};
	}

	req.context.i18n = await getI18nServerInstance(lang, 'server');

	next();
};

export default createMiddlewareDecorator(withTranslationMiddleware);

export type I18NMiddlewareContext = { i18n: I18n };

export type NextApiRequestWithTranslationContext =
	NextApiRequestWithContext<I18NMiddlewareContext>;
