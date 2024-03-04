import { View } from '@diversifiedfinance/design-system/view';
import { useEffect, useRef } from 'react';
import { useUpdateEffect } from '@diversifiedfinance/design-system/hooks';

export const WebView = ({
	name,
	source,
	injectedJavaScript,
	onMessage,
	onLoad,
	onLoadStart,
	startInLoadingState,
	style,
}) => {
	const ref = useRef() as React.MutableRefObject<HTMLIFrameElement>;

	useEffect(() => {
		window.addEventListener('message', onMessage);
		ref.current.onload = onLoad;

		if (injectedJavaScript) {
			const iframeDocument =
				ref.current.contentDocument || ref.current.document;
			const script = iframeDocument.createElement('script');
			script.append(injectedJavaScript);
			iframeDocument.documentElement.appendChild(script);
		}

		if (startInLoadingState) {
			onLoadStart?.();
		}

		return () => {
			window.removeEventListener('message', onMessage);
		};
	}, []);

	return (
		<iframe
			name={name ?? 'Iframe'}
			style={{ border: 0, ...style }}
			ref={ref}
			src={source.uri}
			srcDoc={source.html}
		/>
	);
};
