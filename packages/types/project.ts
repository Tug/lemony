import { WP_Block_Parsed } from 'wp-types';
import { WP_Media } from './wordpress-rest-api';
import { Prices } from './prices';

export interface Project {
	readonly id: number | string;
	readonly title: string;
	readonly slug: string;
	readonly content: WP_Block_Parsed[];
	readonly percent: number;
	readonly tags: string[];
	readonly description: string;
	readonly launchDate: string | Date;
	readonly startOfCrowdfundingDate: string | Date;
	readonly endOfCrowdfundingDate: string | Date;
	readonly durationInYears: number;
	readonly expectedAPR: number; // percentage for display (need to remove the '%' and divide by 100 to get the actual value)
	readonly maxSupply: number;
	readonly tokenName: string;
	readonly tokenSymbol: string;
	readonly tokenPrice: number;
	readonly tokenDecimals: number;
	readonly targetPrice: number;
	readonly media: WP_Media[];
	readonly prices?: Prices;
	readonly documentUrl: string | null;
	readonly feesPercent: number;
	readonly crowdfundingState?: {
		collectedAmount: number;
		maximumAmount: number;
		updatedAt: Date | string;
	};
	readonly products: Array<{ productId: string }>;
	readonly computedAPR?: number;
	readonly yearsForAPRCalculation: 1 | 2 | 3 | 4 | 5 | 6 | 7;
	readonly hasOwnPriceHistory: boolean;
	readonly isPresale: boolean;
}

export interface ProjectFeedResponse {
	projects: Project[];
	cursor: string | null;
}

export const projectsFilterOptions = [
	'all',
	'ongoing',
	'complete',
	'upcoming',
	'ongoingOrVip',
] as const;

export type ProjectsFilterOption = (typeof projectsFilterOptions)[number];
