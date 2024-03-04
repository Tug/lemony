import { Button } from '@diversifiedfinance/design-system/button';
import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useEditAddressFields from '@diversifiedfinance/app/components/edit-address/use-edit-address-fields';

export interface EditAddressContentProps {
	onCompleted: () => void;
}

export const EditAddressContent = ({
	onCompleted,
}: EditAddressContentProps) => {
	const { t } = useTranslation();
	const { editAddressFields, formState, canSubmit, onSubmit } =
		useEditAddressFields({ onCompleted });

	return (
		<View tw="mx-4">
			<View tw="flex-col">{editAddressFields}</View>
			<View tw="my-6">
				<Button
					size="regular"
					disabled={!canSubmit}
					tw={!canSubmit ? 'opacity-50' : ''}
					onPress={onSubmit}
				>
					{formState.isSubmitting ? t('Submitting...') : t('Submit')}
				</Button>
				<View tw="h-1" />
				{/*<Text tw="text-center text-sm text-red-500">*/}
				{/*	{formState.errors.submitError?.message?.toString()}*/}
				{/*</Text>*/}
			</View>
		</View>
	);
};

export default EditAddressContent;
