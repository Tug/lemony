import './script-setup';
import { getUser } from '../src/lib/auth';
import { makeUserInfoResponse } from '../src/dto/userinfo';
import axios from 'axios';
import i18n, { init as i18nInit } from '@diversifiedfinance/app/lib/i18n';
import prisma from '../src/lib/prismadb';
import type { Profile } from '@diversifiedfinance/types';

const axiosInstance = axios.create();
axiosInstance.defaults.baseURL = 'https://api2.branch.io';

axiosInstance.interceptors.request.use(
	(config) => {
		config.data.branch_key = process.env.NEXT_PUBLIC_BRANCH_API_KEY;
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

const createUserReferralLink = async ({
	profile_id,
	referralCode,
}: Pick<Profile, 'profile_id' | 'referralCode'>) => {
	try {
		const { data } = await axiosInstance.post('/v1/url', {
			feature: 'sharing',
			channel: 'diversified',
			campaign: 'in-app-referral',
			alias: `invite/${referralCode}`,
			tags: ['api-generated'],
			data: {
				$canonical_identifier: `user/${profile_id}`,
				$og_title: i18n.t('Diversified Invite') as string,
				$og_description: i18n.t(
					'Join diversified now and earn 1 DIFIED'
				) as string,
				$og_image_url:
					'https://app.diversified.fi/icons/icon-bordered@2x.png',
				// $desktop_url: 'https://diversified.fi',
				$deeplink_path: `/onboarding/sign-up?code=${referralCode}`,
				code: referralCode,
			},
		});
		return data;
	} catch (err) {
		if (err && err?.response.status === 409) {
			const branchAppDomain =
				process.env.NEXT_PUBLIC_BRANCH_APP_DOMAIN ??
				'diversified.app.link';
			return {
				url: `https://${branchAppDomain}/invite/${referralCode}`,
			};
		}
		throw err;
	}
};

export default async function run({
	userId,
	lang = 'fr',
	referralCode = undefined,
}: {
	userId: string;
	lang: string;
	referralCode?: string;
}) {
	if (referralCode) {
		await prisma.user.update({
			where: { id: userId },
			data: {
				referralCode,
			},
		});
	}
	await i18nInit();
	await i18n.changeLanguage(lang);
	const user = await getUser(userId);
	const {
		data: { profile },
	} = makeUserInfoResponse(user);
	const referralLink = await createUserReferralLink(profile);
	console.log(referralLink.url);
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('userId', {
			type: 'string',
			description: 'User Id to set the label to',
		})
		.option('lang', {
			type: 'string',
			description: 'User Id to set the label to',
		})
		.option('referralCode', {
			type: 'string',
			description: 'User Id to set the label to',
		}).argv;
	run(args);
}
