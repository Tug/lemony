import { axios } from '@diversifiedfinance/app/lib/axios';
import { MY_INFO_ENDPOINT } from '@diversifiedfinance/app/hooks/api-hooks';
import { Alert } from '@diversifiedfinance/design-system/alert';
import { toast } from '@diversifiedfinance/design-system/toast';
import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { useTranslation } from 'react-i18next';
import { removeWalletFromBackend } from '@diversifiedfinance/app/lib/add-wallet';

export function useManageAccount() {
	const { mutate } = useSWRConfig();
	const { t } = useTranslation();

	const handleCannabisErrorResponse = useCallback(
		async (url, requestData) => {
			const isEmail = !!requestData.email;
			return new Promise((resolve, reject) => {
				Alert.alert(
					isEmail
						? t(
								'This E-mail is already linked to another Diversified account'
						  )
						: t(
								'This phone number is already linked to another Diversified account'
						  ),
					t(
						`Would you like to link it to this account? \n\n By doing so, you might lose your access to the other account`
					),
					[
						{ text: t('Cancel'), onPress: () => reject() },
						{
							text: t('Confirm'),
							onPress: async () => {
								try {
									await axios({
										url,
										method: 'POST',
										data: {
											...requestData,
											reassign: true,
										},
										overrides: {
											forceAccessTokenAuthorization: true,
										},
									});

									mutate(MY_INFO_ENDPOINT);

									toast.success(
										isEmail
											? t('Email verified')
											: t('Phone number verified')
									);
									resolve();
								} catch (err) {
									toast.error(
										t(
											err.message ??
												(isEmail
													? t(
															'Unable to verify e-mail'
													  )
													: t(
															'Unable to verify phone number'
													  ))
										)
									);
									reject(err);
								}
							},
						},
					]
				);
			});
		},
		[t, mutate]
	);

	const verifyEmail = useCallback(
		async (email: string, code: string) => {
			try {
				await axios({
					url: `/api/user/account/verify-email`,
					method: 'POST',
					data: { email, code },
					overrides: {
						forceAccessTokenAuthorization: true,
					},
				});

				mutate(MY_INFO_ENDPOINT);

				toast.success(
					t('Email added and will soon appear on your profile!')
				);
			} catch (error) {
				if (error?.response.status === 420) {
					const verificationToken =
						error?.response?.data?.verificationToken;
					await handleCannabisErrorResponse(
						`/api/user/account/verify-email`,
						{ email, verificationToken }
					);
				} else {
					throw error;
				}
			}
		},
		[t, mutate, handleCannabisErrorResponse]
	);

	const verifyPhoneNumber = useCallback(
		async (phoneNumber: string, code: string) => {
			try {
				await axios({
					url: `/api/user/account/verify-phone-number`,
					method: 'POST',
					data: { phoneNumber, code },
					overrides: {
						forceAccessTokenAuthorization: true,
					},
				});

				mutate(MY_INFO_ENDPOINT);
				toast.success(t('Phone number successfully verified!'));
			} catch (error: any) {
				// User has already linked this phone to another account so we ask whether we should reassign to this account.
				if (error?.response.status === 420) {
					const verificationToken =
						error?.response?.data?.verificationToken;
					await handleCannabisErrorResponse(
						`/api/user/account/verify-phone-number`,
						{ phoneNumber, verificationToken }
					);
				} else {
					throw error;
				}
			}
		},
		[t, mutate, handleCannabisErrorResponse]
	);

	return {
		verifyPhoneNumber,
		verifyEmail,
	};
}

export function useManageAccountMagic() {
	const { mutate } = useSWRConfig();
	const { t } = useTranslation();

	const handleCannabisErrorResponse = (requestData) => {
		Alert.alert(
			t('This account is already linked to another Diversified account'),
			t(
				`Would you like to link it to this account? \n\n By doing so, you will lose your access to the previous account`
			),
			[
				{ text: t('Cancel') },
				{
					text: t('Confirm'),
					onPress: async () => {
						try {
							await axios({
								url: `/api/wallet/add-magic-wallet`,
								method: 'POST',
								data: {
									...requestData,
									reassign: true,
								},
								overrides: {
									forceAccessTokenAuthorization: true,
								},
							});

							mutate(MY_INFO_ENDPOINT);

							toast.success(t('Social account added'));
						} catch (err) {
							toast.error(
								t(err.message ?? 'Unable to add social account')
							);
						}
					},
				},
			]
		);
	};

	const addSocial = useCallback(
		async (didToken: string, type?: 'google' | 'apple') => {
			try {
				await axios({
					url: `/api/wallet/add-magic-wallet`,
					method: 'POST',
					data: { didToken, replace: true },
					overrides: {
						forceAccessTokenAuthorization: true,
					},
				});

				mutate(MY_INFO_ENDPOINT);

				toast.success(t('Social account added'));
			} catch (error: any) {
				if (error?.response.status === 420) {
					handleCannabisErrorResponse({ didToken });
				} else {
					toast.success(
						t(
							'Unable to add social account to your profile at this time, please try again!'
						)
					);
				}
			}
		},
		[t, mutate, Alert]
	);

	const addEmail = useCallback(
		async (email: string, didToken: string) => {
			try {
				await axios({
					url: `/api/wallet/add-magic-wallet`,
					method: 'POST',
					data: { email, didToken, replace: true },
					overrides: {
						forceAccessTokenAuthorization: true,
					},
				});

				mutate(MY_INFO_ENDPOINT);

				toast.success(
					t('Email added and will soon appear on your profile!')
				);
			} catch (error) {
				if (error?.response.status === 420) {
					handleCannabisErrorResponse({ email, didToken });
				} else {
					toast.success(
						t(
							'Unable to add the email to your profile at this time, please try again!'
						)
					);
				}
			}
		},
		[t, mutate]
	);

	const verifyPhoneNumber = useCallback(
		async (phoneNumber: string, didToken: string) => {
			try {
				await axios({
					url: `/api/wallet/add-magic-wallet`,
					method: 'POST',
					data: { phoneNumber, didToken, replace: true },
					overrides: {
						forceAccessTokenAuthorization: true,
					},
				});

				mutate(MY_INFO_ENDPOINT);
				toast.success(t('Phone number successfully verified!'));
			} catch (error: any) {
				// User has already linked this phone to another account so we ask whether we should reassign to this account.
				if (error?.response.status === 420) {
					handleCannabisErrorResponse({ phoneNumber, didToken });
				} else {
					toast.success(
						t(
							'Unable to verify your phone number at this time, please try again!'
						)
					);
				}
			}
		},
		[t, mutate, Alert]
	);

	const removeAccount = useCallback(
		async (address: string) => {
			try {
				await removeWalletFromBackend(address);

				mutate(MY_INFO_ENDPOINT);

				toast.success(
					t(
						'Account removed and will disappear from your profile soon'
					)
				);
			} catch (error) {
				toast.error(
					error?.response?.data?.message ??
						t(
							'Unable to remove the selected account at this time, please try again'
						)
				);
			}
		},
		[t, mutate]
	);

	const removePhoneNumber = useCallback(
		async (address: string) => {
			try {
				await axios({
					url: `api/wallet/${address}/remove`,
					method: 'DELETE',
				});

				mutate(MY_INFO_ENDPOINT);
				toast.success(t('Phone number has been removed'));
			} catch (error) {
				toast.error(
					t(
						'Unable to remove the phone number at this time, please try again'
					)
				);
			}
		},
		[t, mutate]
	);
	return {
		addEmail,
		addSocial,
		removeAccount,
		removePhoneNumber,
		verifyPhoneNumber,
	};
}
