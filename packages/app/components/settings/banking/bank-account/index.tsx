import { useTranslation } from 'react-i18next';
import React, { Fragment, useCallback, useState } from 'react';
import {
	View,
	Text,
	Button,
	ScrollView,
	ModalSheet,
} from '@diversifiedfinance/design-system';
import {
	useBankAccounts,
	useBankAccountTransactions,
} from '@diversifiedfinance/app/hooks/api-hooks';
import { createParam } from '@diversifiedfinance/app/navigation/lib/use-param';
import { friendlyFormatIBAN } from '@diversifiedfinance/app/lib/yup/validators/iban/ibantools';
import SettingsHeader from '@diversifiedfinance/app/components/settings/header';
import { BottomSheetScrollView } from '@diversifiedfinance/components/bottom-sheet-scroll-view';
import { Payout } from './payout';
import { TransactionRow } from '@diversifiedfinance/app/components/transaction-row';
import { EditBankAccount } from '@diversifiedfinance/app/components/settings/banking/bank-account/edit';
import {
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemTitle,
	DropdownMenuRoot,
	DropdownMenuTrigger,
} from '@diversifiedfinance/design-system/dropdown-menu';
import MoreHorizontal from '@diversifiedfinance/design-system/icon/MoreHorizontal';
import { MenuItemIcon } from '@diversifiedfinance/components/dropdown/menu-item-icon';
import Trash from '@diversifiedfinance/design-system/icon/Trash';
import { Edit } from '@diversifiedfinance/design-system/icon';
import { useNavigateToScreen } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { Alert } from '@diversifiedfinance/design-system/alert';
import { RefreshControl } from 'react-native';

const { useParam } = createParam<{ bankAccountId: string }>();

const Separator = () => <View tw="h-px min-w-full bg-gray-200"></View>;

const DropdownMenu = ({
	onEditPress,
	onDeletePress,
}: {
	onEditPress: () => void;
	onDeletePress: () => void;
}) => {
	const { t } = useTranslation();
	return (
		<DropdownMenuRoot>
			<DropdownMenuTrigger>
				<Button iconOnly={true} variant="tertiary">
					<MoreHorizontal />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent loop>
				<DropdownMenuItem
					onSelect={onEditPress}
					key="edit-bank-account"
				>
					<MenuItemIcon Icon={Edit} ios={{ name: 'pencil' }} />
					<DropdownMenuItemTitle tw="font-semibold text-gray-700 dark:text-neutral-300">
						{t('Edit')}
					</DropdownMenuItemTitle>
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={onDeletePress}
					className="danger"
					key="delete-bank-account"
					destructive
				>
					<MenuItemIcon Icon={Trash} ios={{ name: 'trash' }} />
					<DropdownMenuItemTitle tw="font-semibold text-gray-700 dark:text-neutral-300">
						{t('Delete')}
					</DropdownMenuItemTitle>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenuRoot>
	);
};

export function BankAccountSettings({
	bankAccountId,
}: {
	bankAccountId: string;
}) {
	const { t } = useTranslation();
	const navigateTo = useNavigateToScreen();
	const {
		data: bankAccounts,
		mutate: refreshBankAccounts,
		removeBankAccount,
	} = useBankAccounts();
	const bankAccountInformation = bankAccounts?.find(
		(bankAccount) => bankAccount.id === bankAccountId
	);
	const {
		data: transactions,
		mutate: refreshTransactions,
		isLoading,
	} = useBankAccountTransactions(bankAccountId);
	const [isNewTransferModalVisible, setNewTransferModalVisible] =
		useState<boolean>(false);
	const [isEditNameModalVisible, setEditNameModalVisible] =
		useState<boolean>(false);

	const onTransferCompleted = () => {
		setNewTransferModalVisible(false);
		refreshTransactions();
	};
	const onEditCompleted = () => {
		setEditNameModalVisible(false);
		refreshBankAccounts();
	};
	const onDeletePress = () => {
		Alert.alert(
			t('Delete Bank Account?'),
			t('You will lose the transaction history for this bank account.'),
			[
				{
					text: t('Confirm'),
					onPress: async () => {
						if (!bankAccountId) {
							return;
						}
						await removeBankAccount(bankAccountId);
						await navigateTo('bankingSettings');
						await refreshBankAccounts();
					},
					style: 'destructive',
				},
				{
					text: t('Cancel'),
				},
			]
		);
	};

	if (!bankAccountId || !bankAccountInformation?.ibanData) {
		return null;
	}

	const iban = friendlyFormatIBAN(bankAccountInformation.ibanData.IBAN);
	const bic = bankAccountInformation.ibanData.BIC;

	return (
		<View tw="h-full">
			<ModalSheet
				bodyStyle={{ height: '100%' }}
				visible={isEditNameModalVisible}
				title={t('Edit')}
				snapPoints={['65%']}
				close={() => setEditNameModalVisible(false)}
				onClose={() => setEditNameModalVisible(false)}
			>
				<BottomSheetScrollView>
					<EditBankAccount
						bankAccountId={bankAccountId}
						onComplete={onEditCompleted}
						initialLabel={bankAccountInformation.label}
					/>
				</BottomSheetScrollView>
			</ModalSheet>
			<ModalSheet
				bodyStyle={{ height: '100%' }}
				visible={isNewTransferModalVisible}
				title={t('Transfer funds')}
				snapPoints={['90%']}
				close={() => setNewTransferModalVisible(false)}
				onClose={() => setNewTransferModalVisible(false)}
			>
				<BottomSheetScrollView>
					<Payout
						bankAccountId={bankAccountId}
						onComplete={onTransferCompleted}
					/>
				</BottomSheetScrollView>
			</ModalSheet>
			<SettingsHeader
				title={
					bankAccountInformation?.label ||
					t('Bank Account {{iban}}', { iban: iban?.slice(0, 4) })
				}
				headerRight={
					<DropdownMenu
						onEditPress={() => setEditNameModalVisible(true)}
						onDeletePress={onDeletePress}
					/>
				}
			/>
			<View tw="mx-4 shrink grow">
				<View tw="my-3 flex-row justify-between">
					<View>
						<Text tw="text-gray-500">{t('IBAN')}</Text>
					</View>
					<View tw="ml-4 shrink grow flex-row justify-end">
						<View tw="flex-row items-center">
							<Text tw="text-right text-xs font-bold text-black dark:text-white">
								{iban}
							</Text>
						</View>
					</View>
				</View>
				<Separator />
				<View tw="my-3 flex-row justify-between">
					<View>
						<Text tw="text-gray-500">{t('BIC')}</Text>
					</View>
					<View tw="flex-row">
						<Text tw="text-xs font-bold text-black dark:text-white">
							{bic}
						</Text>
					</View>
				</View>
				<View tw="my-4 shrink grow">
					<View tw="my-2 flex-row justify-between items-center">
						<Text tw="text-base font-bold text-black dark:text-white">
							{t('List of transactions')}
						</Text>
						<Button
							variant="primary"
							size="small"
							onPress={() => setNewTransferModalVisible(true)}
						>
							{t('New Transfer')}
						</Button>
					</View>
					<ScrollView
						tw="h-full"
						refreshControl={
							<RefreshControl
								refreshing={isLoading}
								onRefresh={refreshTransactions}
							/>
						}
					>
						{transactions?.map((transactionData, index) => (
							<Fragment key={index}>
								<TransactionRow item={transactionData} />
								{index !== transactions.length - 1 && (
									<Separator />
								)}
							</Fragment>
						))}
						<View tw="h-12"></View>
					</ScrollView>
				</View>
			</View>
		</View>
	);
}

export default () => {
	const [bankAccountId] = useParam('bankAccountId');
	if (!bankAccountId) {
		return null;
	}

	return <BankAccountSettings bankAccountId={bankAccountId} />;
};
