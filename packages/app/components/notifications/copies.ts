import i18n from '@diversifiedfinance/app/lib/i18n';
import { printMoney } from '@diversifiedfinance/app/lib/money';

export const NOTIFICATION_TYPE_COPY = {
	new_project_primary_market: (content: any, t = i18n.t) =>
		t('New asset available. Discover {{title}}', {
			title: content?.project?.title,
		}),
	new_project_secondary_market: (content: any, t = i18n.t) =>
		t('Asset available on the secondary market: {{title}}', {
			title: content?.project?.title,
		}),
	project_asset_sold: (content: any, t = i18n.t) =>
		t('{{title}} was sold for {{price}}. Claim your gains now!', {
			title: content?.project?.title,
			price: printMoney(content?.totalAmount),
		}),
	user_token_sold: (content: any, t = i18n.t) =>
		t('Your DIFIED have been sold!'),
	portfolio_monthly_update: (content: any, t = i18n.t) => {
		if (!content?.prices?.percent_change) {
			return null;
		}
		const epsilon = 0.01;
		if (Math.abs(content.prices.percent_change) < epsilon) {
			return t(
				'Monthly report. Your portfolio has seen no variation in the last month'
			);
		} else if (content.prices.percent_change < 0) {
			return t(
				'Monthly report. Your portfolio has decreased {{percent}} in the last month',
				new Intl.NumberFormat(i18n.language, {
					style: 'percent',
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				}).format(content.prices.percent_change)
			);
		}
		return t(
			'Monthly report. Your portfolio has increased {{percent}} in the last month',
			new Intl.NumberFormat(i18n.language, {
				style: 'percent',
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}).format(content.prices.percent_change)
		);
	},
	portfolio_weekly_update: (content: any, t = i18n.t) => {
		if (!content?.prices?.percent_change) {
			return null;
		}
		const epsilon = 0.01;
		if (Math.abs(content.prices.percent_change) < epsilon) {
			return t(
				'Monthly report. Your portfolio has seen no variation in the last month'
			);
		} else if (content.prices.percent_change < 0) {
			return t(
				'Weekly report. Your portfolio has decreased {{percent}} in the last month',
				new Intl.NumberFormat(i18n.language, {
					style: 'percent',
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				}).format(content.prices.percent_change)
			);
		}
		return t(
			'Weekly report. Your portfolio has increased {{percent}} in the last month',
			new Intl.NumberFormat(i18n.language, {
				style: 'percent',
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}).format(content.prices.percent_change)
		);
	},
};

export default NOTIFICATION_TYPE_COPY;
