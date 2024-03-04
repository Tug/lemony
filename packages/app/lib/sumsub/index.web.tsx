import { refreshToken } from './common';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import SumsubWebSdk from '@sumsub/websdk-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getLang } from '@diversifiedfinance/app/lib/i18n';

export interface SumsubProps {
	onClose: () => void;
	onSuccess?: () => void;
	onTimeout?: () => void;
}

export default function Sumsub({ onClose, onSuccess, onTimeout }: SumsubProps) {
	const { user } = useUser();
	const [sumsubToken, setSumsubToken] = useState<string>(
		user?.data.providers.sumsub?.token ?? ''
	);

	useEffect(() => {
		// preload token
		if (!sumsubToken) {
			refreshToken().then((token) => setSumsubToken(token));
		}
	}, []);

	if (!sumsubToken) {
		return null;
	}

	const {
		data: { profile },
	} = user;

	const accessTokenExpirationHandler = () => {
		refreshToken().then(setSumsubToken);
	};

	const messageHandler = (type: string, payload: any) => {
		if (type === 'idCheck.applicantStatus') {
			if (
				payload?.reviewResult?.reviewAnswer === 'GREEN' ||
				payload?.reviewResult?.reviewAnswer === 'RED'
			) {
				onClose();
				if (payload?.reviewResult?.reviewAnswer === 'GREEN') {
					onSuccess?.();
				}
			}
		}
	};

	const errorHandler = (data) => {
		console.error('onError', data);
	};

	return (
		<SumsubWebSdk
			accessToken={sumsubToken}
			expirationHandler={accessTokenExpirationHandler}
			config={{
				lang: getLang(),
				// email: profile.email,
				// phone: profile.phoneNumber,
				// i18n: {
				// 	document: {
				// 		subTitles: {
				// 			IDENTITY:
				// 				'Upload a document that proves your identity',
				// 		},
				// 	},
				// },
				// uiConf: {
				// 	customCssStr:
				// 		':root {\n  --black: #000000;\n   --grey: #F5F5F5;\n  --grey-darker: #B2B2B2;\n  --border-color: #DBDBDB;\n}\n\np {\n  color: var(--black);\n  font-size: 16px;\n  line-height: 24px;\n}\n\nsection {\n  margin: 40px auto;\n}\n\ninput {\n  color: var(--black);\n  font-weight: 600;\n  outline: none;\n}\n\nsection.content {\n  background-color: var(--grey);\n  color: var(--black);\n  padding: 40px 40px 16px;\n  box-shadow: none;\n  border-radius: 6px;\n}\n\nbutton.submit,\nbutton.back {\n  text-transform: capitalize;\n  border-radius: 6px;\n  height: 48px;\n  padding: 0 30px;\n  font-size: 16px;\n  background-image: none !important;\n  transform: none !important;\n  box-shadow: none !important;\n  transition: all 0.2s linear;\n}\n\nbutton.submit {\n  min-width: 132px;\n  background: none;\n  background-color: var(--black);\n}\n\n.round-icon {\n  background-color: var(--black) !important;\n  background-image: none !important;\n}',
				// },
			}}
			options={{ addViewportTag: false, adaptIframeHeight: true }}
			onMessage={messageHandler}
			onError={errorHandler}
		/>
	);
}
