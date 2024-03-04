import { Modal } from '@diversifiedfinance/design-system/modal';
import * as Portal from '@radix-ui/react-portal';

import { ModalSheetProps } from '.';

export function ModalSheet({
	visible = true,
	title,
	close,
	onClose,
	snapPoints,
	children,
	...rest
}: ModalSheetProps) {
	return (
		<Portal.Root>
			<Modal
				key={`modalsheet-${title}`}
				title={title}
				mobile_snapPoints={snapPoints}
				onClose={() => {
					// TODO: extract `onClose` to a proper unmount transition completion event.
					close?.();
					onClose?.();
				}}
				visible={visible}
				{...rest}
			>
				{children}
			</Modal>
		</Portal.Root>
	);
}
