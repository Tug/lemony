import { memo } from 'react';

import {
	BottomSheetFooter,
	BottomSheetFooterContainer,
	useBottomSheetInternal,
} from '@gorhom/bottom-sheet';

import { useSafeAreaInsets } from '@diversifiedfinance/design-system/safe-area';

import type { ModalFooterProps } from './types';

function ModalFooterComponent({ children }: ModalFooterProps) {
	const bottomSheetContext = useBottomSheetInternal(true);
	const { bottom } = useSafeAreaInsets();

	if (bottomSheetContext == null) {
		return children;
	}

	return (
		<BottomSheetFooterContainer
			footerComponent={(props) => (
				<BottomSheetFooter bottomInset={bottom} {...props}>
					{children}
				</BottomSheetFooter>
			)}
		/>
	);
}

export const ModalFooter = memo(ModalFooterComponent);
