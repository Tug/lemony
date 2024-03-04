import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { profileToIntercomUserDataWeb } from '@diversifiedfinance/app/lib/intercom/common';
import { useFeature } from '@growthbook/growthbook-react';
import { MyInfo } from '@diversifiedfinance/types/diversified';
import type { Content, ContentType } from '@intercom/intercom-react-native';

const Space: any = {};
const IntercomEvents: any = {};
export { Space, IntercomEvents };

const APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

export const loadScript = () => {
	window.intercomSettings = {
		app_id: APP_ID,
	};

	const w = window as any;
	if (typeof w.Intercom === 'function') {
		w.Intercom('reattach_activator');
		w.Intercom('update', w.intercomSettings);
	} else {
		const d = document;
		const i = function () {
			i.c(arguments);
		};
		i.q = [];
		i.c = function (args) {
			i.q.push(args);
		};
		w.Intercom = i;
		const l = function () {
			const s = d.createElement('script');
			s.type = 'text/javascript';
			s.async = true;
			s.src = 'https://widget.intercom.io/widget/' + APP_ID;
			const x = d.getElementsByTagName('script')[0];
			x.parentNode.insertBefore(s, x);
		};
		if (document.readyState === 'complete') {
			l();
		} else if (w.attachEvent) {
			w.attachEvent('onload', l);
		} else {
			w.addEventListener('load', l, false);
		}
	}

	return w.Intercom;
};

export const updateUser = async (user: MyInfo): Promise<boolean> => {
	window.Intercom?.('update', {
		app_id: APP_ID,
		...(user?.data?.profile &&
			profileToIntercomUserDataWeb(user?.data?.profile)),
		...(user?.data?.providers?.intercom?.userHash && {
			user_hash: user?.data.providers.intercom?.userHash,
		}),
	});
};

export const login = () => {};
export const logout = () => window.Intercom?.('shutdown');

export const useIntercom = () => {
	const { user } = useUser();
	let isDisabled = useFeature('intercom').off;
	let Intercom = null;
	if (typeof window === 'undefined') {
		isDisabled = true;
	} else {
		Intercom = window.Intercom;
	}

	return {
		isEnabled: !isDisabled,
		Intercom,
		login,
		logout,
		updateUser,
		show: async (): Promise<void> => {
			loadScript();
			Intercom('boot', {
				app_id: APP_ID,
				...(user?.data?.profile &&
					profileToIntercomUserDataWeb(user?.data?.profile)),
				...(user?.data?.providers?.intercom?.userHash && {
					user_hash: user?.data.providers.intercom?.userHash,
				}),
			});
		},
		showContent: async (content: Content): Promise<void> => {
			if (isDisabled) {
				return;
			}
			// Make sure the user's locale is in sync with intercom
			try {
				await updateUser(user);
			} catch (err) {
				// ignore error
			}
			switch (content.type) {
				case 'ARTICLE':
					Intercom('showArticle', content.id);
					break;
				// case 'CAROUSEL':
				// 	Intercom('showCarousel', content.id);
				// 	break;
				case 'SURVEY':
					Intercom('startSurvey', content.id);
					break;
				case 'HELP_CENTER_COLLECTIONS':
					Intercom('showSpace', 'help');
					break;
				case 'CONVERSATION':
					Intercom('showConversation', content.id);
					break;
			}
		},
	};
};
