import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { PortalProvider } from '@gorhom/portal';
import { ScrollView } from '@diversifiedfinance/design-system/scroll-view';

export function LoginModal({ children }: ViewProps) {
	return (
		<PortalProvider>
			<ScrollView style={styles.container}>{children}</ScrollView>
		</PortalProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 16,
	},
});
