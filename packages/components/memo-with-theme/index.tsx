import { useColorScheme } from '@diversifiedfinance/design-system/color-scheme';
import { ComponentType, memo } from 'react';

export const withMemoAndColorScheme = <
	T extends ComponentType<any>,
	P extends {}
>(
	Comp: T
) => memo<P>(withColorScheme(Comp));

export const withColorScheme =
	<T extends ComponentType<any>>(Comp: T) =>
	// eslint-disable-next-line react/display-name
	(props: any) => {
		const { colorScheme } = useColorScheme();
		return <Comp {...props} colorScheme={colorScheme} />;
	};
