import type {
	VIPLevelBenefits,
	UserBenefits,
} from '@diversifiedfinance/types/diversified';
import { checkCampaigns } from './campaigns';

export const defaultBenefits: UserBenefits = {
	difiedPerReferral: 1,
	xpPerDified: 100,
	xpPerReferral: 1000,
};

export const defaultVipLevelBenefits: VIPLevelBenefits = {
	user: defaultBenefits,
	regular: defaultBenefits,
	vip1: {
		difiedPerReferral: 2,
		xpPerDified: 100,
		xpPerReferral: 1000,
	},
	vip2: {
		difiedPerReferral: 3,
		xpPerDified: 100,
		xpPerReferral: 1000,
	},
	vip3: {
		difiedPerReferral: 3,
		xpPerDified: 100,
		xpPerReferral: 1000,
	},
	vip4: {
		difiedPerReferral: 3,
		xpPerDified: 100,
		xpPerReferral: 1000,
	},
	vip_affiliate: defaultBenefits,
	vip_influencer: defaultBenefits,
	vip_affiliate_custom: defaultBenefits,
	vip_ama: defaultBenefits,
};

export function getLiveVIPLevelBenefits() {
	const { vipLevelBenefits: currentVipLevelBenefits } = checkCampaigns({
		vipLevelBenefits: defaultVipLevelBenefits,
	});
	return currentVipLevelBenefits;
}
