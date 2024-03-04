import { memo } from 'react';

import { Button } from '@diversifiedfinance/design-system/button';
import { CloseLarge } from '@diversifiedfinance/design-system/icon';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';

import type { ModalHeaderProps } from './types';

const MODAL_HEADER_CONTAINER_TW = 'p-4 flex-row items-center justify-between';
const MODAL_HEADER_TITLE_TW = 'dark:text-white font-bold text-center';

function ModalHeaderComponent({
	title,
	endContentComponent: EndContentComponent,
	startContentComponent: StartContentComponent,
	tw = '',
	onClose,
	closeButtonProps,
}: ModalHeaderProps) {
	return (
		<View
			tw={[
				MODAL_HEADER_CONTAINER_TW,
				Array.isArray(tw) ? tw.join(' ') : tw,
			]}
		>
			{StartContentComponent ? (
				<StartContentComponent />
			) : (
				<Button
					variant="tertiary"
					size="small"
					onPress={onClose}
					iconOnly
					hitSlop={10}
					tw="mr-2"
					{...closeButtonProps}
				>
					<CloseLarge />
				</Button>
			)}

			<Text tw={[MODAL_HEADER_TITLE_TW, 'flex-1 text-base font-bold']}>
				{title}
			</Text>

			{EndContentComponent ? (
				<EndContentComponent />
			) : (
				<View tw="ml-2 w-12" collapsable={true} />
			)}
		</View>
	);
}

export const ModalHeader = memo(ModalHeaderComponent);