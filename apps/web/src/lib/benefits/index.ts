import prisma, { SchemaTypes, UserWithLabels } from '../prismadb';
import { FreeCreditsBenefit } from './free-credits';
import { Benefit } from './benefit';
import { UserLabelBenefit } from './user-label';
import { TokenClaimBenefit, TokenClaimBenefitToSponsor } from './token-claim';
import { getLiveVIPLevelBenefits } from '../vip';

export { Benefit, FreeCreditsBenefit, UserLabelBenefit, TokenClaimBenefit };

// Glossary:
// - Sponsor/referrer/affiliate partner/influencer: person who shared the invite link
// - Sponsored/referree/referred user: person who used the invite code during signup
//
// const hasReceivedOrGivenMoneyOnSignup = (user: UserWithWallets) =>
// 	Boolean(
// 		user.labels.find(
// 			({ label }) =>
// 				label === 'vip1_10eur_credited' || // 10eur for early adopters
// 				label === 'referral_10eur_credited' || // default 10eur for new users that used a valid referral code
// 				label === 'referral_10eur_credited_to_sponsor' || // default 10eur users that invited customers
// 				label === 'referral_influencer_20eur_credited' || // 20eur given to each referral user (nothing for the sponsor/influencer (with vip_influencer label))
// 				label === 'referral_vip_20eur_credited_to_sponsor' // 20eur credited to sponsor (with vip_affiliate label) for bringing a paying customer
// 		)
// 	);

// sponsor is influencer or B2C partner or AMA => disable default benefits
export const specialCaseSponsorLabels = [
	'vip_influencer',
	'vip_affiliate_custom',
	'vip_ama',
];

const sponsorHasSpecialCase = (
	sponsor: { labels: Array<{ label: string }> },
	excludeLabel?: string | string[]
) => {
	const excludeLabels = Array.isArray(excludeLabel)
		? excludeLabel
		: [excludeLabel];
	const labels = !excludeLabel
		? specialCaseSponsorLabels
		: specialCaseSponsorLabels.filter(
				(label) => !excludeLabels.includes(label)
		  );
	return Boolean(sponsor.labels.find(({ label }) => labels.includes(label)));
};

export const hasReceivedCreditsForOwnSubscription = [
	'vip1_10eur_credited',
	'referral_10eur_credited',
	'referral_influencer_20eur_credited',
	'referral_1dified_claim_credited',
	'referral_influencer_2dified_claim_credited',
];

const userHasReceivedCreditsForOwnSubscription = (
	user: { labels: Array<{ label: string }> },
	excludeLabel?: string
) => {
	const labels = !excludeLabel
		? hasReceivedCreditsForOwnSubscription
		: hasReceivedCreditsForOwnSubscription.filter(
				(label) => label !== excludeLabel
		  );
	return Boolean(user.labels.find(({ label }) => labels.includes(label)));
};

export const equivalentBenefitLabels = {
	referral_1dified_claim_credited: [
		'referral_1dified_claim_credited',
		'referral_influencer_20eur_credited',
		'referral_10eur_credited',
		'referral_influencer_2dified_claim_credited',
	],
	referral_influencer_2dified_claim_credited: [
		'referral_1dified_claim_credited',
		'referral_influencer_20eur_credited',
		'referral_10eur_credited',
		'referral_influencer_2dified_claim_credited',
	],
	referral_1dified_claim_credited_to_sponsor: [
		'referral_vip_20eur_credited_to_sponsor',
		'referral_1dified_claim_credited_to_sponsor',
		'referral_2dified_claim_credited_to_sponsor',
		'referral_10eur_credited_to_sponsor',
		'referral_vip_2dified_claim_credited_to_sponsor',
	],
	referral_2dified_claim_credited_to_sponsor: [
		'referral_vip_20eur_credited_to_sponsor',
		'referral_1dified_claim_credited_to_sponsor',
		'referral_2dified_claim_credited_to_sponsor',
		'referral_10eur_credited_to_sponsor',
		'referral_vip_2dified_claim_credited_to_sponsor',
	],
	referral_vip_2dified_claim_credited_to_sponsor: [
		'referral_vip_20eur_credited_to_sponsor',
		'referral_1dified_claim_credited_to_sponsor',
		'referral_2dified_claim_credited_to_sponsor',
		'referral_10eur_credited_to_sponsor',
		'referral_vip_2dified_claim_credited_to_sponsor',
	],
	referral_10eur_credited: [
		'referral_1dified_claim_credited',
		'referral_influencer_20eur_credited',
		'referral_10eur_credited',
		'referral_influencer_2dified_claim_credited',
	],
	referral_influencer_20eur_credited: [
		'referral_1dified_claim_credited',
		'referral_influencer_20eur_credited',
		'referral_10eur_credited',
		'referral_influencer_2dified_claim_credited',
	],
	referral_10eur_credited_to_sponsor: [
		'referral_vip_20eur_credited_to_sponsor',
		'referral_1dified_claim_credited_to_sponsor',
		'referral_2dified_claim_credited_to_sponsor',
		'referral_10eur_credited_to_sponsor',
		'referral_vip_2dified_claim_credited_to_sponsor',
	],
	referral_vip_20eur_credited_to_sponsor: [
		'referral_vip_20eur_credited_to_sponsor',
		'referral_1dified_claim_credited_to_sponsor',
		'referral_2dified_claim_credited_to_sponsor',
		'referral_10eur_credited_to_sponsor',
		'referral_vip_2dified_claim_credited_to_sponsor',
	],
};

export const hasEquivalentBenefitApplied = (
	user: Pick<SchemaTypes.User, 'labels'>,
	label: string
) => {
	const equivalentLabels = equivalentBenefitLabels[label];
	const userLabels = user.labels.map(({ label }) => label);
	if (equivalentLabels) {
		return equivalentLabels.some((label) => {
			return userLabels.includes(label);
		});
	}
	return false;
};

export const allBenefits: Benefit[] = [
	new UserLabelBenefit({
		name: 'VIP label given to users invited by an AMA (Asset Manager Advisor) or a VIP Special',
		userLabel: 'vip1',
		async shouldApply(this: FreeCreditsBenefit, user: UserWithLabels) {
			if (!user.referrerId) {
				return false;
			}
			const referrer = await prisma.user.findUnique({
				where: { id: user.referrerId, disabled: false },
				select: {
					id: true,
					kycStatus: true,
					labels: true,
				},
			});
			if (!referrer || referrer.kycStatus !== 'completed') {
				return false;
			}
			const isReferrerAMA = referrer.labels.find(
				({ label }) => label === 'vip_ama' || label === 'vip_special'
			);
			if (!isReferrerAMA) {
				return false;
			}
			return true;
		},
	}),
	new TokenClaimBenefit({
		name: '1 DIFIED claim to customers invited by a sponsor',
		userLabel: 'referral_1dified_claim_credited',
		vipLevel: 'regular',
		async shouldApply(this: TokenClaimBenefit, user: UserWithLabels) {
			if (!user.referrerId) {
				return false;
			}
			const isCustomer = Boolean(
				user.labels.find(({ label }) => label === 'customer')
			);
			const isEligible =
				isCustomer ||
				(user.kycStatus === 'completed' &&
					user.createdAt >= new Date('2023-11-03'));
			if (!isEligible) {
				return false;
			}
			const referrer = await prisma.user.findUnique({
				where: { id: user.referrerId, disabled: false },
				select: {
					id: true,
					kycStatus: true,
					labels: true,
				},
			});
			if (
				!referrer ||
				referrer.kycStatus !== 'completed' ||
				// no special tag except for vip_affiliate_custom => 1 DIFIED to user
				sponsorHasSpecialCase(referrer, ['vip_affiliate_custom']) ||
				userHasReceivedCreditsForOwnSubscription(user) ||
				hasEquivalentBenefitApplied(user, this.userLabel)
			) {
				return false;
			}
			return true;
		},
	}),
	new TokenClaimBenefitToSponsor({
		name: '1 DIFIED to regular sponsor for a referral turned customer',
		userLabel: 'referral_1dified_claim_credited_to_sponsor',
		vipLevel: 'regular',
		async shouldApply(this: TokenClaimBenefit, user: UserWithLabels) {
			if (!user.referrerId) {
				return false;
			}
			const isCustomer = Boolean(
				user.labels.find(({ label }) => label === 'customer')
			);
			const isEligible =
				isCustomer ||
				(user.kycStatus === 'completed' &&
					user.createdAt >= new Date('2023-11-03'));
			if (!isEligible) {
				return false;
			}
			const referrer = await prisma.user.findUnique({
				where: { id: user.referrerId, disabled: false },
				select: {
					id: true,
					kycStatus: true,
					labels: true,
				},
			});
			if (
				!referrer ||
				referrer.kycStatus !== 'completed' ||
				sponsorHasSpecialCase(referrer) ||
				hasEquivalentBenefitApplied(user, this.userLabel)
			) {
				return false;
			}
			const vipLevelBenefits = getLiveVIPLevelBenefits();
			const nonMatchingVipLabels = Object.entries(vipLevelBenefits)
				.filter(
					([label, benefits]) =>
						benefits.difiedPerReferral >
						vipLevelBenefits[this.vipLevel].difiedPerReferral
				)
				.map(([label]) => label);
			const isInvitedByVIP = referrer.labels.some(({ label }) =>
				nonMatchingVipLabels.includes(label)
			);
			if (isInvitedByVIP) {
				return false;
			}
			return true;
		},
	}),
	new TokenClaimBenefitToSponsor({
		name: '2 DIFIED to vip1 sponsor for a referral turned customer',
		userLabel: 'referral_2dified_claim_credited_to_sponsor',
		vipLevel: 'vip1',
		async shouldApply(this: TokenClaimBenefit, user: UserWithLabels) {
			if (!user.referrerId) {
				return false;
			}
			const isCustomer = Boolean(
				user.labels.find(({ label }) => label === 'customer')
			);
			const isEligible =
				isCustomer ||
				(user.kycStatus === 'completed' &&
					user.createdAt >= new Date('2023-11-03'));
			if (!isEligible) {
				return false;
			}
			const referrer = await prisma.user.findUnique({
				where: { id: user.referrerId, disabled: false },
				select: {
					id: true,
					kycStatus: true,
					labels: true,
				},
			});
			if (
				!referrer ||
				referrer.kycStatus !== 'completed' ||
				sponsorHasSpecialCase(referrer) ||
				hasEquivalentBenefitApplied(user, this.userLabel)
			) {
				return false;
			}
			const vipLevelBenefits = getLiveVIPLevelBenefits();
			// TODO: rely on the order of vipLevels instead of looking at the benefits
			const higherVipLabels = Object.entries(vipLevelBenefits)
				.filter(
					([label, benefits]) =>
						benefits.difiedPerReferral >
						vipLevelBenefits[this.vipLevel].difiedPerReferral
				)
				.map(([label]) => label);
			const isInvitedByHigherVIP = referrer.labels.some(({ label }) =>
				higherVipLabels.includes(label)
			);
			const isInvitedByVIP1 = referrer.labels.some(
				({ label }) => label === this.vipLevel
			);
			if (isInvitedByHigherVIP || !isInvitedByVIP1) {
				return false;
			}
			return true;
		},
	}),
	new TokenClaimBenefitToSponsor({
		name: '3 DIFIED to vip2 sponsor for a referral turned customer',
		userLabel: 'referral_3dified_claim_credited_to_sponsor',
		vipLevel: 'vip2',
		async shouldApply(this: TokenClaimBenefit, user: UserWithLabels) {
			if (!user.referrerId) {
				return false;
			}
			const isCustomer = Boolean(
				user.labels.find(({ label }) => label === 'customer')
			);
			const isEligible =
				isCustomer ||
				(user.kycStatus === 'completed' &&
					user.createdAt >= new Date('2023-11-03'));
			if (!isEligible) {
				return false;
			}
			const referrer = await prisma.user.findUnique({
				where: { id: user.referrerId, disabled: false },
				select: {
					id: true,
					kycStatus: true,
					labels: true,
				},
			});
			if (
				!referrer ||
				referrer.kycStatus !== 'completed' ||
				sponsorHasSpecialCase(referrer) ||
				hasEquivalentBenefitApplied(user, this.userLabel)
			) {
				return false;
			}
			// TODO: higher VIP levels than vip2
			const isInvitedByVIP2 = referrer.labels.some(
				({ label }) => label === this.vipLevel
			);
			if (!isInvitedByVIP2) {
				return false;
			}
			return true;
		},
	}),
	new TokenClaimBenefit({
		name: '2 DIFIED for users invited by influencer',
		userLabel: 'referral_influencer_2dified_claim_credited',
		vipLevel: 'vip_influencer',
		async shouldApply(this: TokenClaimBenefit, user: UserWithLabels) {
			if (!user.referrerId) {
				return false;
			}
			const isCustomer = Boolean(
				user.labels.find(({ label }) => label === 'customer')
			);
			const isEligible =
				isCustomer ||
				(user.kycStatus === 'completed' &&
					user.createdAt >= new Date('2023-11-03'));
			if (!isEligible) {
				return false;
			}
			const referrer = await prisma.user.findUnique({
				where: { id: user.referrerId, disabled: false },
				select: {
					id: true,
					kycStatus: true,
					labels: true,
				},
			});
			if (
				!referrer ||
				referrer.kycStatus !== 'completed' ||
				sponsorHasSpecialCase(referrer, 'vip_influencer') ||
				userHasReceivedCreditsForOwnSubscription(user) ||
				hasEquivalentBenefitApplied(user, this.userLabel)
			) {
				return false;
			}
			const isInvitedByInfluencer = referrer.labels.some(
				({ label }) => label === this.vipLevel
			);
			if (!isInvitedByInfluencer) {
				return false;
			}
			return true;
		},
	}),
];

export async function checkUserPendingBenefits(
	user: UserWithLabels,
	fakeRun = false
) {
	const appliedBenefits = [];
	for (const benefit of allBenefits) {
		if (await benefit.shouldApply(user)) {
			// console.log(benefit.name + ' should apply');
			if (!fakeRun) {
				try {
					await benefit.apply(user);
				} catch (err) {
					console.error(
						`Error while applying benefit ${benefit.name}`,
						err
					);
					continue;
				}
			}
			appliedBenefits.push(benefit.name);
		}
	}
	return appliedBenefits;
}

export function getBenefitByName(benefitName?: string | null) {
	if (!benefitName) {
		return undefined;
	}
	return allBenefits.find(({ name }) => name === benefitName);
}
