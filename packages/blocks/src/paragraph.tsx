import CircularProgressBlock from './custom/circular-progress';
import RawHTML from '@diversifiedfinance/components/raw-html';
import { Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { WP_Block_Parsed } from 'wp-types';

export default function ParagraphBlock(blockParsedProps: WP_Block_Parsed) {
	const {
		attrs: { content, className, align },
	} = blockParsedProps;

	if (className?.includes('circular-progress-bar')) {
		return <CircularProgressBlock {...blockParsedProps} />;
	}

	const extraClasses = [];

	if (align) {
		extraClasses.push(`text-${align}`);
	}

	// Note: Tailwind doesn't support dynamic classes
	// We're using a workaround though, see:
	// - `design-system/text/force-tailwind-compile.tsx`
	// - `safelist` props in `tailwind.config.js` (not working atm)
	return (
		<View tw={['py-2', className ?? '']}>
			<RawHTML
				tw={[
					'text-sm dark:text-white leading-5',
					className,
					...extraClasses,
				].join(' ')}
			>
				{content}
			</RawHTML>
		</View>
	);
}
