import { useTranslation } from 'react-i18next';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Text, View } from '@diversifiedfinance/design-system';
import { useBankAccounts } from '@diversifiedfinance/app/hooks/api-hooks';
import { BottomSheetScrollView } from '@diversifiedfinance/components/bottom-sheet-scroll-view';
import { Address } from '@diversifiedfinance/types/diversified';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import useEditAddressFields from '@diversifiedfinance/app/components/edit-address/use-edit-address-fields';
import { BottomSheetModalProvider } from '@diversifiedfinance/design-system/bottom-sheet';
import { useRouter } from '@diversifiedfinance/design-system/router';
import useEditIbanFields from '@diversifiedfinance/app/components/settings/modals/add-bank-account/use-edit-iban-fields';
import { useModalScreenContext } from '@diversifiedfinance/design-system/modal-screen';
import { createParam } from 'solito';

export const isAddressComplete = (address?: Address) => {
	if (!address) {
		return false;
	}
	return Boolean(address.addressLine1 && address.city && address.postalCode);
};

const { useParam } = createParam<{ action: 'unlock' }>();

export const AddBankAccount = ({
	onCompleted,
}: {
	onCompleted?: () => void;
}) => {
	const { user, isLoading: isUserLoading, mutate: refreshUser } = useUser();
	const router = useRouter();
	const [action] = useParam('action');
	const { t } = useTranslation();
	const { mutate: refreshBankAccounts } = useBankAccounts();
	const {
		editAddressFields,
		formState: addressFormState,
		canSubmit: canSubmitAddress,
		onSubmit: onSubmitAddress,
	} = useEditAddressFields();
	const {
		editIbanFields,
		formState: ibanFormState,
		canSubmit: canSubmitIban,
		onSubmit: onSubmitIban,
	} = useEditIbanFields();
	const mustFillInAddress = !isAddressComplete(user?.data.profile.address);
	const modalScreenContext = useModalScreenContext();
	const canSubmit = mustFillInAddress ? canSubmitAddress : canSubmitIban;
	const isSubmitting =
		ibanFormState.isSubmitting || addressFormState.isSubmitting;
	let ctaText;
	if (isSubmitting) {
		ctaText = t('Submitting...');
	} else if (mustFillInAddress) {
		ctaText = t('Next');
	} else {
		ctaText = t('Submit');
	}

	const onSubmit = async () => {
		if (mustFillInAddress) {
			await onSubmitAddress();
			await refreshUser();
			return;
		}
		await onSubmitIban();
		await refreshBankAccounts();
		if (onCompleted) {
			onCompleted?.();
		} else {
			router.pop();
		}
	};

	useEffect(() => {
		if (!isUserLoading) {
			modalScreenContext?.snapToIndex(mustFillInAddress ? 0 : 1);
		}
	}, [modalScreenContext, isUserLoading, mustFillInAddress]);

	return (
		<BottomSheetModalProvider>
			<BottomSheetScrollView>
				<View tw="mx-4">
					{action === 'unlock' && (
						<View tw="mb-4 rounded-lg bg-homeLightBlue dark:bg-gray-900 p-4">
							<Text tw="text-sm font-semibold text-themeNight dark:text-themeYellow">
								{t(
									'Get access to presales by completing your bank details'
								)}
							</Text>
						</View>
					)}
					{mustFillInAddress ? (
						<View tw="mt-2">
							<View tw="mb-3">
								<Text tw="text-base font-bold text-black dark:text-white">
									{t('Residential address')}
								</Text>
							</View>
							<Text tw="text-sm text-gray-700 dark:text-gray-300">
								{t(
									'Your residential address is required to register your bank account'
								)}
							</Text>
							{editAddressFields}
						</View>
					) : (
						<View tw="mt-2">
							<View tw="mb-3">
								<Text tw="text-lg text-black dark:text-white">
									{t('Bank Account Information')}
								</Text>
							</View>
							{editIbanFields}
						</View>
					)}

					<View tw="mt-4 mb-16">
						<Button
							size="regular"
							variant="primary"
							disabled={!canSubmit}
							tw={!canSubmit ? 'opacity-50' : ''}
							onPress={onSubmit}
						>
							{ctaText}
						</Button>
					</View>
				</View>
			</BottomSheetScrollView>
		</BottomSheetModalProvider>
	);
};
