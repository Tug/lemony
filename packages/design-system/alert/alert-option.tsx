import { memo } from 'react';
import { AlertButton } from 'react-native';

import { Button } from '@diversifiedfinance/design-system/button';
import type { ButtonVariant } from '@diversifiedfinance/design-system/button';

type AlertBtnType = AlertButton & {
	hide: () => void;
};

// get Alert btn preset style type.
const getAlertBtnVariant = (style: AlertButton['style']) => {
	const variantMap = new Map<AlertButton['style'], ButtonVariant>([
		['cancel', 'outlined'],
		['default', 'primary'],
		['destructive', 'danger'],
	]);
	return variantMap.get(style) ?? 'primary';
};

export const AlertOption = memo<AlertBtnType>(function AlertBtn({
	onPress,
	text,
	style,
	hide,
}) {
	return (
		<Button
			variant={getAlertBtnVariant(style)}
			size="small"
			onPress={() => {
				onPress?.(text);
				hide();
			}}
		>
			{text ?? 'OK'}
		</Button>
	);
});
