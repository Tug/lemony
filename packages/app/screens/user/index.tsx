import { Button } from '@diversifiedfinance/design-system/button';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import { createParam } from 'solito';
import { useLink } from 'solito/link';
import { useTranslation } from 'react-i18next';

const { useParam } = createParam<{ id: string }>();

export default function UserDetailScreen() {
	const { t } = useTranslation();
	const [id] = useParam('id');
	const linkProps = useLink({ href: '/' });

	return (
		<View>
			<Text tw="text-black dark:text-white">
				{t(`User ID: {{id}}`, { id })}
			</Text>
			<Button {...linkProps}>Go Home</Button>
		</View>
	);
}
