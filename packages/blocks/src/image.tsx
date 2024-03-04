import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import { WP_Block_Parsed } from 'wp-types';
import { Image } from '@diversifiedfinance/design-system/image';
import { Link } from '@diversifiedfinance/app/navigation/link';
import { useResponsiveImageView } from '@diversifiedfinance/app/hooks/use-responsive-image-view';

export default function ImageBlock({
	attrs: { href, url, alt, align },
}: WP_Block_Parsed) {
	const { getViewProps, getImageProps } = useResponsiveImageView({
		source: { uri: url },
	});
	const extraClasses = [];
	if (align) {
		extraClasses.push(`justify-${align}`);
	}
	const image = (
		<Image
			{...getImageProps()}
			alt={alt}
			source={{ uri: url }}
			transition={500}
		/>
	);

	return (
		<View {...getViewProps()} tw={['m-1', ...extraClasses]}>
			{href ? <Link href={href}>{image}</Link> : image}
		</View>
	);
}
