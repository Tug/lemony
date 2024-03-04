import { refreshToken } from './common';
import { useAlert } from '@diversifiedfinance/design-system/alert';
import './types';
import sumsubSDK, {
	OnEvent,
	OnActionResult,
	OnStatusChanged,
	OnLog,
	SNSMobileSDK,
} from '@sumsub/react-native-mobilesdk-module';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getLang } from '@diversifiedfinance/app/lib/i18n';
import { Analytics, EVENTS } from '@diversifiedfinance/app/lib/analytics';

export * from '@sumsub/react-native-mobilesdk-module';

const getSNSMobileSDK = ({
	accessToken,
	debug = true,
	analyticsEnabled = true,
	locale = 'en',
	onActionResult,
	onStatusChanged,
	onEvent,
	onLog,
}: {
	accessToken?: string;
	debug?: boolean;
	analyticsEnabled?: boolean;
	locale?: string;
	onActionResult?: OnActionResult;
	onStatusChanged?: OnStatusChanged;
	onEvent?: OnEvent;
	onLog?: OnLog;
}): SNSMobileSDK => {
	const snsBuilder = sumsubSDK
		.init(accessToken, refreshToken)
		.withHandlers({
			onEvent,
			onActionResult,
			onStatusChanged,
			onLog,
		})
		.withAnalyticsEnabled(analyticsEnabled);

	if (debug) {
		snsBuilder.withDebug(debug);
	}
	if (locale) {
		snsBuilder.withLocale(locale); // if we want to override the system locale
	}
	if (process.env.STAGE === 'development') {
		snsBuilder.onTestEnv();
	}

	return snsBuilder.build();
};

export interface SumsubProps {
	opened: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	onTimeout?: () => void;
	onActionResult?: OnActionResult;
	onStatusChanged?: OnStatusChanged;
	onLog?: OnLog;
}

export default function Sumsub({
	opened,
	onClose,
	onSuccess,
	onActionResult,
	onStatusChanged: onStatusChangedCb,
	onLog,
}: SumsubProps) {
	const Alert = useAlert();
	const [accessToken, setAccessToken] = useState<string | undefined>(
		undefined
	);
	const snsMobileSDK = useRef<SNSMobileSDK | undefined>(undefined);
	const timeoutId = useRef<NodeJS.Timeout>();
	const onEvent: OnEvent = ({ eventType, payload }) => {
		if (eventType === 'Analytics') {
			Analytics.track(EVENTS.KYC_EVENT, {
				name: payload.eventName,
				payload: payload.eventPayload,
			});
		}
	};

	const onStatusChanged: OnStatusChanged = useCallback(
		({ prevStatus, newStatus }) => {
			if (newStatus === 'Approved') {
				if (timeoutId.current) {
					clearTimeout(timeoutId.current);
				}
				timeoutId.current = setTimeout(onClose, 4 * 1000);
			}
			if (newStatus === 'Pending') {
				if (timeoutId.current) {
					clearTimeout(timeoutId.current);
				}
				timeoutId.current = setTimeout(() => {
					onSuccess?.();
					onClose();
				}, 120 * 1000);
			}
			onStatusChangedCb?.({ prevStatus, newStatus });
		},
		[onStatusChangedCb]
	);

	useEffect(() => {
		// preload token
		refreshToken().then((token) => setAccessToken(token));

		return () => {
			snsMobileSDK.current?.dismiss();
			if (timeoutId.current) {
				clearTimeout(timeoutId.current);
				timeoutId.current = undefined;
			}
		};
	}, []);

	useEffect(() => {
		if (!opened && snsMobileSDK.current) {
			snsMobileSDK.current?.dismiss();
			snsMobileSDK.current = undefined;
		}
		if (opened && !snsMobileSDK.current && accessToken) {
			snsMobileSDK.current = getSNSMobileSDK({
				locale: getLang(),
				accessToken,
				onActionResult,
				onStatusChanged,
				onLog,
				onEvent,
			});

			// if (user.data.profile.kycStatus === 'pending') {
			// 	Alert.alert(
			// 		'Verification pending',
			// 		'Your profile is already being verified. This operation should take a few minutes up to 24h.'
			// 	);
			// 	onDone?.();
			// 	return;
			// }
			// if (user.data.profile.kycStatus === 'completed') {
			// 	Alert.alert(
			// 		'Profile verified',
			// 		'Your profile is already verified.'
			// 	);
			// 	onDone?.();
			// 	return;
			// }
			snsMobileSDK.current
				.launch()
				.then((result) => {
					if (result.status === 'Approved') {
						onSuccess?.();
					}
				})
				.catch((error: Error) => {
					Alert.alert('KYC Error', error.message);
				})
				.finally(onClose);
		}
	}, [opened, accessToken]);

	return null;
}
