import SettingsHeader from '../header';
import { View } from '@diversifiedfinance/design-system/view';
import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import {
	useEurWallet,
	useOrders,
} from '@diversifiedfinance/app/hooks/api-hooks';
import {
	Button,
	Checkbox,
	Spinner,
	Text,
} from '@diversifiedfinance/design-system';
import { ContactUsButton } from '@diversifiedfinance/app/components/portfolio/contact-us-button';
import { Label } from '@diversifiedfinance/design-system/label';
import { axios } from '@diversifiedfinance/app/lib/axios';
import { useAuth } from '@diversifiedfinance/app/hooks/auth/use-auth';
import { Trans, useTranslation } from 'react-i18next';

export const DeleteAccountSettings = () => {
	const { t } = useTranslation();
	const { data: ordersResponse, isLoading: isLoadingOrders } = useOrders();
	const { data: eurWallet, isLoading: isLoadingEurWallet } = useEurWallet();
	const [canDeleteAccount, setAccountDeletable] = useState<
		boolean | undefined
	>(undefined);
	const [hasConfirmed, confirm] = useState<boolean>(false);
	const { logout } = useAuth();
	const isLoading = isLoadingOrders || isLoadingEurWallet;

	useEffect(() => {
		if (!isLoadingOrders && !isLoadingEurWallet && ordersResponse?.orders) {
			const canDelete =
				ordersResponse.orders.length === 0 &&
				(!eurWallet || eurWallet.balance === 0);
			setAccountDeletable(canDelete);
		}
	}, [isLoadingOrders, isLoadingEurWallet, ordersResponse, eurWallet]);

	const onDeleteAccountPress = async () => {
		await axios({
			method: 'DELETE',
			url: '/api/userinfo',
		});
		logout();
	};

	return (
		<ScrollView>
			<View tw="m-4 flex-col">
				<SettingsHeader title={t('Close my account?')} />
				{canDeleteAccount && (
					<View tw="my-4">
						<View tw="my-2">
							<Text tw="font-semibold text-black dark:text-white">
								{t(
									`In order to use Diversified again in the future you will need to create a new account.`
								)}
							</Text>
						</View>
						<View tw="my-2 mt-4 flex-row items-center">
							<Checkbox
								id={`checkbox-confirm`}
								onChange={confirm}
								checked={hasConfirmed}
								aria-label="checkbox-confirm"
							/>
							<Label
								htmlFor="checkbox-confirm"
								tw="mx-4 flex-row items-center leading-5 text-black dark:text-white"
							>
								<Trans t={t}>
									I understand that closing my account means
									the deletion of all my data.
								</Trans>
							</Label>
						</View>
					</View>
				)}
				{canDeleteAccount === false && (
					<View tw="my-4">
						<Text tw="font-semibold text-black dark:text-white">
							<Trans t={t}>
								Your account still has tokens or credits
								associated with it. Please contact support.
							</Trans>
						</Text>
					</View>
				)}
				<View tw="mt-8">
					{canDeleteAccount === false ? (
						<ContactUsButton />
					) : (
						<Button
							variant="danger"
							size="regular"
							onPress={onDeleteAccountPress}
							tw={!hasConfirmed || isLoading ? 'opacity-50' : ''}
							disabled={!hasConfirmed || isLoading}
						>
							<>
								{isLoading && (
									<Spinner
										size="small"
										color="white"
										secondaryColor="red"
									/>
								)}
								<Text tw="mx-2 text-base font-semibold text-white">
									{t('Close account')}
								</Text>
							</>
						</Button>
					)}
				</View>
			</View>
		</ScrollView>
	);
};

export default DeleteAccountSettings;
