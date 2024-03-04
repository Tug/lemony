import { NavigationElementsProvider } from './lib/navigation-elements-context';
import { useState } from 'react';

export function NavigationProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isHeaderHidden, setIsHeaderHidden] = useState(false);
	const [isTabBarHidden, setIsTabBarHidden] = useState(false);

	return (
		<NavigationElementsProvider
			value={{
				isHeaderHidden,
				setIsHeaderHidden,
				isTabBarHidden,
				setIsTabBarHidden,
			}}
		>
			{children}
		</NavigationElementsProvider>
	);
}
