import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { useAlert } from '@diversifiedfinance/design-system/alert';

import { axios } from '@diversifiedfinance/app/lib/axios';
import { Logger } from '@diversifiedfinance/app/lib/logger';
import { useMagicSocialAuth } from '@diversifiedfinance/app/lib/social-logins';
import { MY_INFO_ENDPOINT } from '@diversifiedfinance/app/hooks/api-hooks';

import { toast } from '@diversifiedfinance/design-system/toast';
import { useTranslation } from 'react-i18next';

type AddSocialType = {
	type: 'google' | 'apple';
};

export const useAddMagicSocialAccount = () => {
	const { mutate } = useSWRConfig();
	const Alert = useAlert();
	const { t } = useTranslation();
	const { performMagicAuthWithGoogle, performMagicAuthWithApple } =
		useMagicSocialAuth();

	const state = useSWRMutation(
		MY_INFO_ENDPOINT,
		async (_key: string, values: { arg: AddSocialType }) => {
			let res;
			try {
				if (values.arg.type === 'google') {
					res = await performMagicAuthWithGoogle();
				} else if (values.arg.type === 'apple') {
					res = await performMagicAuthWithApple();
				}
			} catch (error: any) {
				Logger.error('Magic social auth failed ', error);
				throw new Error('Connecting failed or aborted');
			}

			if (res) {
				const params = {
					didToken: res.magic.idToken,
					providerAccessToken: res.oauth.accessToken,
					providerScope: res.oauth.scope,
				};

				try {
					await axios({
						url: `/api/wallet/add-magic-wallet`,
						method: 'POST',
						data: params,
						overrides: {
							forceAccessTokenAuthorization: true,
						},
					});
					toast.success(t('Social account added'));
				} catch (error: any) {
					Logger.error('Add social error', error);

					if (error?.response.status === 420) {
						Alert.alert(
							`This account is already linked to another Diversified account`,
							`Would you like to link it to this account? \n\n By doing so, you will lose your access to the previous account`,
							[
								{ text: 'Cancel' },
								{
									text: 'Confirm',
									onPress: async () => {
										await axios({
											url: `/v2/wallet/add-magic-wallet`,
											method: 'POST',
											data: {
												...params,
												reassign: true,
											},
											overrides: {
												forceAccessTokenAuthorization: true,
											},
										});

										mutate(MY_INFO_ENDPOINT);
										toast.success(
											t('Social account added')
										);
									},
								},
							]
						);
					}
				}
			} else {
				// this throw is important to catch all magic errors but instagram
				throw new Error('Connecting failed or aborted');
			}
		}
	);

	return state;
};
