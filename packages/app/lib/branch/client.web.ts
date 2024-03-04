import { BranchEventType } from './types';
import type { DeepLinkData, InitOptions, SessionData } from 'branch-sdk';

let sdk;

export const Branch = {
	async init(options: InitOptions = {}): Promise<SessionData> {
		if (typeof window === 'undefined') {
			return;
		}
		if (!process.env.NEXT_PUBLIC_BRANCH_API_KEY) {
			throw new Error(
				'NEXT_PUBLIC_BRANCH_API_KEY env variable is missing'
			);
		}
		if (!sdk) {
			sdk = (await import('branch-sdk')).default;
		}
		sdk.init(process.env.NEXT_PUBLIC_BRANCH_API_KEY, options);
	},
	setIdentity(identity: string) {
		sdk.setIdentity(identity);
	},
	async logEvent(
		eventType: BranchEventType,
		event_data_and_custom_data?: {},
		content_items?: Array<{}>,
		customer_event_alias?: string
	): Promise<void> {
		// See: https://help.branch.io/developers-hub/docs/tracking-commerce-content-lifecycle-and-custom-events
		const eventNameWeb = eventType
			.split(/\.?(?=[A-Z])/)
			.join('_')
			.toUpperCase();
		const data = Object.fromEntries(
			Object.entries(event_data_and_custom_data ?? {})
				.map(([key, value]) => {
					const webKeyFormat = key
						.replace(/([a-z])([A-Z])/g, '$1_$2')
						.toLowerCase()
						.replace(/^event/, '');
					return value !== undefined ? [webKeyFormat, value] : null;
				})
				.filter(Boolean)
		);
		return sdk.logEvent(
			eventNameWeb,
			data,
			content_items,
			customer_event_alias
		);
	},
	async track(eventName: string, metadata: {}) {
		return sdk.track(eventName, metadata);
	},
	async link(data: DeepLinkData): Promise<void> {
		return new Promise((resolve, reject) =>
			sdk.link(data, (err, url) => {
				if (err) {
					return reject(err);
				}
				return resolve({ url });
			})
		);
	},
	async data(): Promise<SessionData | null> {
		return new Promise((resolve, reject) =>
			sdk.data((err, data) => {
				if (err) {
					return reject(err);
				}
				return resolve(data);
			})
		);
	},
	async first(): Promise<SessionData | null> {
		return new Promise((resolve, reject) => {
			sdk.first((err, data) => {
				if (err) {
					return reject(err);
				}
				return resolve(data);
			});
		});
	},
	setBranchViewData(data: DeepLinkData) {
		return sdk.setBranchViewData(data);
	},
	logout() {
		if (!sdk.logout) {
			throw new Error('Branch SDK has not been imported yet.');
		}
		return new Promise((resolve, reject) =>
			sdk.logout((err, data) => {
				if (err) {
					return reject(err);
				}
				return resolve(data);
			})
		);
	},
	getFirstReferringParams() {
		return this.first();
	},
	getLatestReferringParams() {
		return this.data();
	},
	subscribe() {
		return () => {};
	},
};

export const getUrlFromBundle = (params: any) => undefined;
