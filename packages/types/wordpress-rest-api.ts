export type {
	WP_REST_API_Tag,
	WP_REST_API_Tags,
	WP_REST_API_Attachment,
	WP_REST_API_Post,
	WP_Block_Parsed,
	WP_Block,
} from 'wp-types';

import type {
	WP_REST_API_Attachment,
	WP_REST_API_Post,
	WP_Block_Parsed,
} from 'wp-types';

export interface WP_Block_Parsed_With_Extra extends WP_Block_Parsed {
	rendered?: string;
}

export type WP_Media = Pick<
	WP_REST_API_Attachment,
	'id' | 'source_url' | 'media_details'
>;

export interface WP_REST_API_Project extends WP_REST_API_Post {
	has_blocks: boolean;
	block_data: WP_Block_Parsed_With_Extra[];
	acf: {
		launch_date: string; // for visibility
		start_of_crowdfunding_date: string;
		end_of_crowdfunding_date: string;
		duration_in_years: number;
		expected_apr: number;
		max_supply: number;
		visibility: 'development' | 'staging' | 'production';
		token_name: string;
		token_symbol: string;
		token_decimals?: number;
		oracle_name?: string;
		oracle_id?: string;
		oracle_url?: string;
		data?: string;
		oracle_has_vat?: boolean;
		oracle_vat_amount?: number;
		oracle_has_fees?: boolean;
		oracle_percentage_fees?: number;
		oracle_fixed_fees?: number;
		oracle_currency?: string;
		oracle_update_frequency?:
			| '_1sec'
			| '_1min'
			| '_1hour'
			| '_1day'
			| '_1week'
			| '_1month'
			| '_3month'
			| '_6month'
			| '_1year'
			| 'unknown';
		sto_wallet_address?: string;
		owner_email?: string;
		template_url?: string;
		documentUrl?: string;
		diversified_fees_percent: number;
		partner: string;
		products: Array<{
			product_id: number | string;
			quantity: number;
			unit_price: number;
			price_includes_vat: boolean;
			vat_percentage: number;
			purchase_date: string | Date;
			resale_fee_percent: number;
			resale_fee_fixed: number;
		}>;
		years_for_apr_calculation: number;
		has_own_price_history: number;
		is_presale: boolean;
	};
}

export interface WP_REST_API_Product extends WP_REST_API_Post {
	acf: {
		supplier: string;
		oracle_products: number[];
	};
}

export interface WP_REST_API_Oracle_Product extends WP_REST_API_Post {
	acf: {
		oracle_name: string;
		oracle_id?: string;
		oracle_url?: string;
		data?: string;
		oracle_has_vat?: boolean;
		oracle_vat_amount?: number;
		oracle_has_fees?: boolean;
		oracle_percentage_fees?: number;
		oracle_fixed_fees?: number;
		oracle_price_currency?: 'EUR';
		oracle_update_frequency?:
			| '_1sec'
			| '_1min'
			| '_1hour'
			| '_1day'
			| '_1week'
			| '_1month'
			| '_3month'
			| '_6month'
			| '_1year'
			| 'unknown';
		enabled: boolean;
	};
}
