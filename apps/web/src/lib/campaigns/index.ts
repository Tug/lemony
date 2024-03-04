import type { VIPLevelBenefits } from '@diversifiedfinance/types/diversified';

class Campaign {
	name: string;
	enabled: boolean;
	condition: () => boolean;
	transform: <T>(input: T) => T;

	constructor({ name, enabled, condition, transform }) {
		this.name = name;
		this.enabled = enabled;
		this.condition = condition;
		this.transform = transform;
	}
}

export const campaigns = [
	new Campaign({
		name: '2x-dified-on-referal',
		enabled: true,
		condition: () =>
			new Date() > new Date('2024-01-12T20:00:00.000Z') && // Dates are UTC
			new Date() < new Date('2024-01-14T23:00:00.000Z'),
		transform: ({
			vipLevelBenefits,
		}: {
			vipLevelBenefits: VIPLevelBenefits;
		}) => ({
			vipLevelBenefits: Object.fromEntries(
				Object.entries(vipLevelBenefits).map(([vipLabel, benefits]) => {
					return [
						vipLabel,
						{
							...benefits,
							difiedPerReferral: benefits.difiedPerReferral * 2,
						},
					];
				})
			),
		}),
	}),
	new Campaign({
		name: '3x-dified-on-referal',
		enabled: true,
		condition: () =>
			new Date() > new Date('2024-02-16T16:00:00.000Z') && // Dates are UTC
			new Date() < new Date('2024-02-18T23:00:00.000Z'),
		transform: ({
			vipLevelBenefits,
		}: {
			vipLevelBenefits: VIPLevelBenefits;
		}) => ({
			vipLevelBenefits: Object.fromEntries(
				Object.entries(vipLevelBenefits).map(([vipLabel, benefits]) => {
					return [
						vipLabel,
						{
							...benefits,
							difiedPerReferral: benefits.difiedPerReferral * 3,
						},
					];
				})
			),
		}),
	}),
];

export function checkCampaigns(constants: {
	vipLevelBenefits: VIPLevelBenefits;
}) {
	let output = constants;
	const enabledCampaigns = campaigns.filter((campaign) => campaign.enabled);
	for (const campaign of enabledCampaigns) {
		if (campaign.condition()) {
			// console.log('constants transformed by campaign', campaign.name);
			output = campaign.transform(output);
		}
	}
	return output;
}
