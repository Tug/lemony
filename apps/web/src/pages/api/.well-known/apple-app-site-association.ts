import type { NextApiRequest, NextApiResponse } from 'next';

export const APP_SCHEME_PREFIX = process.env.SCHEME ?? 'fi.diversified.app';
export const BUNDLE_ID = `${APP_SCHEME_PREFIX}${
	process.env.STAGE !== 'production' ? `.${process.env.STAGE}` : ''
}`;
const TEAM_ID = 'XAFNF48HYL';

const association = {
	applinks: {
		apps: [],
		details: [
			{
				appID: `${TEAM_ID}.${BUNDLE_ID}`,
				// TODO NEXT: replace wildcard with specific routes
				paths: ['*'],
			},
		],
	},
};

export default (_: NextApiRequest, response: NextApiResponse) => {
	return response.status(200).send(association);
};
