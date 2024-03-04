import { ModalSheet, Spinner, View } from '@diversifiedfinance/design-system';
import { WebView } from '@diversifiedfinance/app/components/webview';
import { useEffect, useState } from 'react';
import { BrowserInfoData } from '@diversifiedfinance/app/lib/mangopay';
import { Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';

const mobileWebView3DsBrowserDataHtml = `<!DOCTYPE html><html><body></body></html>`;
const mobileWebView3DsBrowserDataJS = `
(function () {
  var threeDsBrowserData = {
 	AcceptHeader: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    JavaEnabled:
      typeof window.navigator.javaEnabled === 'function'
        ? window.navigator.javaEnabled()
        : false,
    Language: window.navigator.language,
    ColorDepth: window.screen.colorDepth,
    ScreenHeight: window.screen.height,
    ScreenWidth: window.screen.width,
    TimeZoneOffset: new Date().getTimezoneOffset(),
    JavascriptEnabled: true,
    UserAgent: window.navigator.userAgent
  };
  const parentWindow = window.ReactNativeWebView || window.parent;
  parentWindow.postMessage(
    JSON.stringify({
      type: "3ds-browser-data",
      payload: threeDsBrowserData,
    })
  );
})()
`;

export interface WebView3DS2Props {
	onBrowserData: (browserInfo: BrowserInfoData) => void;
	destinationUrl?: string;
	on3DS2Completed: () => void;
	visible: boolean;
	setVisible: (newVisibility: boolean) => void;
}

export function WebView3DS2({
	onBrowserData,
	destinationUrl,
	on3DS2Completed,
}: WebView3DS2Props) {
	const { t } = useTranslation();
	const [visible, setVisible] = useState<boolean>(false);
	const [browserDataSent, setBrowserDataSent] = useState<boolean>(false);
	const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);

	useEffect(() => {
		if (destinationUrl) {
			Keyboard.dismiss();
			setVisible(true);
		}
	}, [destinationUrl]);

	if (!browserDataSent) {
		return (
			<WebView
				style={{ width: 0, height: 0 }}
				source={{
					html: mobileWebView3DsBrowserDataHtml,
				}}
				injectedJavaScript={mobileWebView3DsBrowserDataJS}
				onMessage={(event) => {
					const nativeEvent = event?.nativeEvent ?? event;
					let browserDataMsg;
					try {
						browserDataMsg = JSON.parse(nativeEvent?.data || '{}');
					} catch (err) {
						browserDataMsg = nativeEvent?.data || {};
					}
					if (browserDataMsg.type === '3ds-browser-data') {
						// do what you need with the browser info
						onBrowserData(browserDataMsg.payload);
						setBrowserDataSent(true);
					}
				}}
			/>
		);
	}

	if (!destinationUrl) {
		return null;
	}

	return (
		<ModalSheet
			bodyStyle={{ height: '100%' }}
			snapPoints={['100%']}
			title={t('3D Secure')}
			visible={visible}
			bodyStyle={{ paddingTop: 0 }}
			close={() => setVisible(false)}
			onClose={() => setVisible(false)}
		>
			<View tw="h-full w-full">
				<WebView
					style={{ width: '100%', height: '100%' }}
					source={{
						uri: destinationUrl,
					}}
					startInLoadingState
					onLoadStart={() => setIsLoadingPage(true)}
					onLoad={() => setIsLoadingPage(false)}
					onMessage={(event) => {
						const nativeEvent = event?.nativeEvent ?? event;
						let browserDataMsg;
						try {
							browserDataMsg = JSON.parse(
								nativeEvent?.data || '{}'
							);
						} catch (err) {
							browserDataMsg = nativeEvent?.data || {};
						}
						if (
							browserDataMsg.type === '3ds-completed' &&
							browserDataMsg.status !== 'FAILED'
						) {
							setVisible(false);
							on3DS2Completed?.();
						}
					}}
				/>
				{isLoadingPage && (
					<View tw="absolute bottom-0 left-0 right-0 top-0 z-10 items-center justify-center">
						<Spinner />
					</View>
				)}
			</View>
		</ModalSheet>
	);
}
