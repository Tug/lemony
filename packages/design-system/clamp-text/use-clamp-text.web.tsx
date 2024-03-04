import { MultiClamp } from './clamp.web';
import type { ClampTextParams } from './use-clamp-text';
import { useEffect, useLayoutEffect } from 'react';
import { Platform } from 'react-native';

const useIsomorphicLayoutEffect =
	typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const tw =
	'text-sm font-bold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-600 rounded-sm px-0.5';
export const useClampText = ({
	element,
	text = '',
	rows = 3,
	ellipsis = '...',
	expandText = 'More',
	foldText = 'Less',
}: ClampTextParams) => {
	useIsomorphicLayoutEffect(() => {
		if (Platform.OS !== 'web' || !element) return;
		new MultiClamp(element, {
			rows,
			ellipsis,
			expandable: true,
			foldable: true,
			foldTagClassName: tw,
			expendTagClassName: tw,
			expandText,
			foldText,
			// @ts-ignore
			originText: text,
		});
	}, [element, ellipsis, expandText, foldText, rows, text]);

	return {
		showMore: false,
		showLess: false,
		onShowLess: () => {},
		onShowMore: () => {},
		innerText: text,
		onTextLayout: () => undefined,
	};
};
