import { Button, Spinner, Text, View } from '@diversifiedfinance/design-system';
import { useCards } from '@diversifiedfinance/app/hooks/api-hooks';
import React, { useCallback, useState } from 'react';
import CreditCardInput, {
	CardDetails,
} from '@diversifiedfinance/components/credit-card-input';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { registerCard } from '@diversifiedfinance/app/lib/mangopay';
import { toast } from '@diversifiedfinance/design-system/toast';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { useTranslation } from 'react-i18next';

export interface AddCardFormProps {
	onNewCardAdded?: (cardId: string) => void;
}

export function AddCardForm({ onNewCardAdded }: AddCardFormProps) {
	const { t } = useTranslation();
	const { user } = useUser();
	const { mutate: updateCards } = useCards();
	const [cardDetails, updateCardDetails] = useState<CardDetails>();
	const router = useRouter();
	const canSubmit = cardDetails?.complete ?? false;
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const onSubmit = useCallback(() => {
		if (!cardDetails) {
			return;
		}
		setIsSubmitting(true);
		registerCard(user, cardDetails)
			.then((cardData) => {
				toast.success(t('Card added!'));
				return cardData;
			})
			.then(async (cardData) => {
				await updateCards();
				onNewCardAdded?.(cardData.CardId);
			})
			.catch((err) => {
				const errorMessage =
					err.response?.data?.error ??
					err?.ResultMessage ??
					err.message ??
					err.toString();
				toast.error(errorMessage);
			})
			.finally(() => setIsSubmitting(false));
	}, [t, updateCards, onNewCardAdded, cardDetails, router]);

	return (
		<View tw="my-4">
			<CreditCardInput
				onUpdate={(details: CardDetails) => {
					updateCardDetails(details);
				}}
			/>
			<Button
				variant="primary"
				size="regular"
				onPress={onSubmit}
				tw={['mt-8', !canSubmit ? 'opacity-50' : '']}
				disabled={!canSubmit}
			>
				<>
					{isSubmitting && (
						<Spinner
							size="small"
							color="white"
							secondaryColor="black"
						/>
					)}
					<Text tw="mx-4 text-base font-bold text-white dark:text-black">
						{t('Add card')}
					</Text>
				</>
			</Button>
		</View>
	);
}
