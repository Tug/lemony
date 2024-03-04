import { useScrollToEnd } from './useScrollToEnd';
import { BottomSheetScrollView } from '@diversifiedfinance/components/bottom-sheet-scroll-view';
import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { PortalProvider } from '@gorhom/portal';

export function LoginModal({ children }: ViewProps) {
	const { scrollViewRef } = useScrollToEnd();

	return (
		<PortalProvider>
			<BottomSheetScrollView ref={scrollViewRef} style={styles.container}>
				{children}
			</BottomSheetScrollView>
		</PortalProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 16,
		minHeight: 400,
	},
});
