import i18n from '@diversifiedfinance/app/lib/i18n';

// WARNING: if you add a new notification type, you must add it to
// getNotificationTitleAndDescription as well
// `special_*` notifications are ignored on the server for creating
// notification preferences. They should not be visible on the notifications pane.
export const pushNotificationTypes = [
	'system_funds_received',
	'system_free_credits_received',
	'system_dified_claim_received',
	'marketing_general',
	'new_project_primary_market',
	'new_project_secondary_market',
	'project_token_available',
	'project_asset_sold',
	'user_token_sold',
	'user_token_acquired',
	'portfolio_weekly_update',
	'portfolio_monthly_update',
	'special_home_carousel',
] as const;

export type PushNotificationKey = (typeof pushNotificationTypes)[number];

export const notificationGroups = [
	'general',
	'project_activity',
	'user_portfolio',
	'tokens_activity',
] as const;

export type NotificationGroupKey = (typeof notificationGroups)[number];
export type NotificationGroupValue = Array<PushNotificationKey>;

export const nGroups: NotificationGroups = {
	general: [
		'system_funds_received',
		'system_free_credits_received',
		'marketing_general',
	],
	project_activity: [
		'new_project_primary_market',
		'new_project_secondary_market',
		'project_token_available',
		'project_asset_sold',
	],
	user_portfolio: ['portfolio_weekly_update', 'portfolio_monthly_update'],
	tokens_activity: ['user_token_sold', 'user_token_acquired'],
};

export type NotificationGroups = Record<
	NotificationGroupKey,
	NotificationGroupValue
> &
	Partial<Record<'Others', NotificationGroupValue>>;

export const getNotificationTitleAndDescription = (
	notificationType: PushNotificationKey,
	t = i18n.t
): { title: string | undefined; description: string | undefined } => {
	switch (notificationType) {
		case 'system_funds_received':
			return {
				title: t('Funds Transfer'),
				description: t('When funds arrive in your wallet.'),
			};
		case 'system_free_credits_received':
			return {
				title: t('Free credits transfer'),
				description: t('When free credits arrive in your wallet.'),
			};
		case 'marketing_general':
			return {
				title: t('General updates'),
				description: t(
					'News on Diversified and the alternative investment market.'
				),
			};
		case 'new_project_primary_market':
			return {
				title: t('New asset'),
				description: t(
					'When a project is available for sale on the primary market.'
				),
			};
		case 'new_project_secondary_market':
			return {
				title: t('Asset on the secondary market'),
				description: t(
					'When a project becomes available on the secondary market.'
				),
			};
		case 'project_token_available':
			return {
				title: t('DIFIED available'),
				description: t(
					'When a project you follow has DIFIED available for sale.'
				),
			};
		case 'project_asset_sold':
			return {
				title: t('Asset sold'),
				description: t(
					'When a project underlying asset has been sold.'
				),
			};
		case 'user_token_sold':
			return {
				title: t('DIFIED sold'),
				description: t('When some of your DIFIED have been sold.'),
			};
		case 'user_token_acquired':
			return {
				title: t('DIFIED acquired'),
				description: t(
					'When some of your orders were successfully completed.'
				),
			};
		case 'portfolio_weekly_update':
			return {
				title: t('Portfolio weekly updates'),
				description: t(
					'Receive evolution of your portfolio once a week.'
				),
			};
		case 'portfolio_monthly_update':
			return {
				title: t('Portfolio monthly updates'),
				description: t(
					'Receive evolution of your portfolio once a month.'
				),
			};
	}
	return {
		title: undefined,
		description: undefined,
	};
};

export const getGroupName = (
	groupKey: NotificationGroupKey,
	t = i18n.t
): string => {
	switch (groupKey) {
		case 'general':
			return t('General');
		case 'project_activity':
			return t('Project Activity');
		case 'tokens_activity':
			return t('DIFIED Activity');
		case 'user_portfolio':
			return t('My Portfolio');
	}
	return t('Others');
};
