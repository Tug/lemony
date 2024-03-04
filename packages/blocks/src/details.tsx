import React from 'react';
import { WP_Block_Parsed } from 'wp-types';
import { ClampText } from '@diversifiedfinance/design-system/clamp-text';
import { View } from '@diversifiedfinance/design-system';
import { useTranslation } from 'react-i18next';

export default function DetailsBlock({
	innerBlocks,
	attrs: { className, content },
}: WP_Block_Parsed) {
	const { t } = useTranslation();
	return (
		<View tw={['my-2', className ?? '']}>
			<ClampText
				tw={['text-sm dark:text-white leading-5', className ?? '']}
				text={content ?? innerBlocks?.[0].attrs.content ?? ''}
				maxLines={2}
				foldText={t('less')}
				expandText={t('more')}
			/>
		</View>
	);
	// return <View>{renderBlocks(innerBlocks)}</View>;
}
