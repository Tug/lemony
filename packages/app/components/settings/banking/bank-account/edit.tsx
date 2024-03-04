import React, { useState } from 'react';
import { useBankAccounts } from '@diversifiedfinance/app/hooks/api-hooks';
import { View, Button } from '@diversifiedfinance/design-system';
import { useTranslation } from 'react-i18next';
import { Input } from '@diversifiedfinance/design-system/input';

export const EditBankAccount = ({
	bankAccountId,
	onComplete,
	initialLabel,
}: {
	bankAccountId: string;
	onComplete?: () => void;
	initialLabel?: string;
}) => {
	const { t } = useTranslation();
	const { editBankAccount } = useBankAccounts();
	const [bankAccountName, setBankAccountName] = useState<string>(
		initialLabel ?? ''
	);

	const save = async () => {
		await editBankAccount(bankAccountId, { label: bankAccountName });
		onComplete?.();
	};

	return (
		<View tw="mx-4">
			<View tw="mt-4">
				<Input
					label={t('Label')}
					value={bankAccountName}
					placeholder={t('Bank Account label')}
					onChangeText={setBankAccountName}
				/>
			</View>
			<View tw="mt-5">
				<Button size="regular" variant="primary" onPress={save}>
					{t('Save')}
				</Button>
			</View>
		</View>
	);
};
