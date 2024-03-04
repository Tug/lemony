import { styled } from '@diversifiedfinance/design-system/tailwind';
import { Children } from 'react';

function RawHTML({ children, ...props }: any) {
	let rawHtml = '';

	// Cast children as an array, and concatenate each element if it is a string.
	Children.toArray(children).forEach((child) => {
		if (typeof child === 'string' && child.trim() !== '') {
			rawHtml += child;
		}
	});

	return (
		<div
			dangerouslySetInnerHTML={{ __html: rawHtml }}
			className={props.tw}
			{...props}
			style={{
				display: 'contents',
				...props.style,
			}}
		/>
	);
}

export default RawHTML; //styled(RawHTML);
