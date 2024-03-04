import { Button, Modal, Text, View } from '@diversifiedfinance/design-system';
import { useEffect, useLayoutEffect, useState } from 'react';
import { isMobile, browserName } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import SvgDiversifiedApp from '@diversifiedfinance/design-system/icon/DiversifiedApp';
import { Image } from '@diversifiedfinance/design-system/image';

const browserIcon = {
	Chrome: `https://www.redditstatic.com/shreddit/assets/browsers/chrome.png`,
	Safari: `https://www.redditstatic.com/shreddit/assets/browsers/safari.png`,
	Firefox: `https://www.redditstatic.com/shreddit/assets/browsers/firefox.png`,
};

// const r = {
// 	appLink: '',
// 	getAppLink(params = {}) {
// 		if (!this.appLink) {
// 			const url = new URL('https://diversified.app.link');
// 			const searchParams = {
// 				...params,
// 				...this.getReferrerParams(),
// 			};
// 			for (const paramName in searchParams) {
// 				if (paramName && searchParams[paramName]) {
// 					url.searchParams.set(paramName, searchParams[paramName]);
// 				}
// 			}
// 			this.appLink = url.toString();
// 		}
// 		return this.appLink;
// 	},
// 	getReferrerParams() {
// 		const e = new URL(
// 			document
// 				.getElementsByTagName('diversified-app')?.[0]
// 				?.getAttribute('referrer') ||
// 				document.referrer ||
// 				'https://diversified.fi/'
// 		);
// 		return {
// 			referrer_domain: e.hostname,
// 			referrer_url: e.pathname,
// 		};
// 	},
// };

export function OpenInAppModal() {
	const { t } = useTranslation();
	const [visible, setVisible] = useState(false);
	const simplifiedBrowserName = browserName?.replace(/Mobile\W+/, '');

	const dismiss = () => {
		localStorage.setItem(
			'open-in-app-modal-dismissed-at',
			new Date().toISOString()
		);
		setVisible(false);
	};
	const openApp = () => {
		//Linking.openURL('https://app.diversified.finance');
	};

	useLayoutEffect(() => {
		// TODO: only show modal on load when user is
		if (isMobile) {
			const dismissedAt = localStorage.getItem(
				'open-in-app-modal-dismissed-at'
			);
			if (
				dismissedAt &&
				// dismissed less than 1 day ago
				new Date(dismissedAt) > new Date(Date.now() - 864e5)
			) {
				return;
			}
			setVisible(true);
		}
	}, []);

	return (
		<Modal
			visible={visible}
			title={t('See this page in...')}
			closeButtonProps={{
				tw: 'pointer-events-none hover:opacity-0 opacity-0',
			}}
		>
			<View tw="mb-4">
				<View>
					<View tw="m-2 flex-row items-center justify-between mx-4">
						<View tw="flex-row items-center">
							<View tw="rounded-lg overflow-hidden border-1 border-[#0000001a]">
								<SvgDiversifiedApp width={32} height={32} />
							</View>
							<View tw="ml-2">
								<Text tw="text-lg text-gray-900 dark:text-white">
									{t('Diversified App')}
								</Text>
							</View>
						</View>
						<View tw="min-w-[120px]">
							<Button
								backgroundColors={{
									default: ['bg-themeNight', 'bg-themeNight'],
									pressed: ['bg-gray-700', 'bg-gray-200'],
								}}
								labelStyle={{ color: 'white' }}
								onPress={openApp}
							>
								Open
							</Button>
						</View>
					</View>
					<View tw="m-2 flex-row items-center justify-between mx-4">
						<View tw="flex-row items-center">
							<View tw="rounded-lg overflow-hidden border-1 border-[#0000001a]">
								<Image
									alt="browser icon"
									style={{
										width: 32,
										height: 32,
									}}
									source={{
										uri:
											browserIcon[
												simplifiedBrowserName
											] ?? browserIcon.Chrome,
									}}
								/>
							</View>
							<View tw="ml-2">
								<Text tw="text-lg text-gray-900 dark:text-white">
									{simplifiedBrowserName}
								</Text>
							</View>
						</View>
						<View tw="min-w-[120px]">
							<Button variant="tertiary" onPress={dismiss}>
								Continue
							</Button>
						</View>
					</View>
				</View>
			</View>
		</Modal>
	);
}
