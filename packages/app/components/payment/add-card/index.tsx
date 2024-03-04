import React, { useCallback } from 'react';
import { AddCardForm } from './form';
import { BottomSheetModalProvider } from '@diversifiedfinance/design-system/bottom-sheet';
import { BottomSheetScrollView } from '@diversifiedfinance/components/bottom-sheet-scroll-view';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { View } from '@diversifiedfinance/design-system';

export interface AddCardProps {
	onNewCardAdded?: (cardId: string) => void;
}

export function AddCard({ onNewCardAdded }: AddCardProps) {
	return (
		<BottomSheetModalProvider>
			<AddCardForm onNewCardAdded={onNewCardAdded} />
		</BottomSheetModalProvider>
	);
}

export function AddCardBottomSheet() {
	const router = useRouter();
	const onNewCardAdded = useCallback(() => {
		router.pop();
	}, [router]);

	return (
		<BottomSheetScrollView>
			<View tw="mx-4">
				<AddCard onNewCardAdded={onNewCardAdded} />
			</View>
		</BottomSheetScrollView>
	);
}
