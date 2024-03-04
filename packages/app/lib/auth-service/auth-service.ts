import { axios } from '@diversifiedfinance/app/lib/axios';
import i18n from '@diversifiedfinance/app/lib/i18n';

export interface AuthServiceConfig {
	locale?: string;
	pinCount: number;
}

class User {
	private metadata: {
		email?: string;
		phoneNumber?: string;
	};

	constructor(metadata?: { email?: string; phoneNumber?: string }) {
		this.metadata = metadata ?? {};
	}

	setMetadata(metadata: { email?: string; phoneNumber?: string }) {
		this.metadata = metadata;
	}

	getMetadata() {
		return this.metadata;
	}
}

export class AuthService {
	public lastError?: string;
	public user: User = new User({});
	public config: AuthServiceConfig;

	constructor() {
		this.setConfig({});
	}

	setConfig(config?: Partial<AuthServiceConfig>) {
		const defaultConfig = {
			locale: i18n.language,
			pinCount: 6,
		};
		this.config = {
			...defaultConfig,
			...config,
		};
	}

	async loginWithEmail({ email }: { email: string }) {
		this.user.setMetadata({ email });
		this.lastError = undefined;
		await axios({
			url: '/api/auth/otp',
			method: 'POST',
			data: {
				email,
				locale: this.config?.locale,
			},
		});
	}

	async loginWithSMS({ phoneNumber }: { phoneNumber: string }) {
		this.user.setMetadata({ phoneNumber });
		this.lastError = undefined;
		await axios({
			url: '/api/auth/otp',
			method: 'POST',
			data: {
				phoneNumber,
				locale: this.config?.locale,
			},
		});
	}

	reset() {
		this.lastError = undefined;
		this.user.setMetadata({});
	}
}

export default new AuthService();
