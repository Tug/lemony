import { BottomSheetScrollView } from '@diversifiedfinance/components/bottom-sheet-scroll-view';
import { BottomSheetModalProvider } from '@diversifiedfinance/design-system/bottom-sheet';
import React, { useCallback, useRef } from 'react';
import { ScrollView as RNScrollView } from 'react-native';
import { EditAddressContent } from './content';
import { useRouter } from '@diversifiedfinance/design-system/router';
import { createParam } from '@diversifiedfinance/app/navigation/lib/use-param';

type Query = {
	redirectUri?: string;
	error?: string;
};

const { useParam } = createParam<Query>();

export const EditAddress = () => {
	const [redirectUri] = useParam('redirectUri');
	const scrollViewRef = useRef<RNScrollView>(null);
	const router = useRouter();

	const onCompleted = useCallback(() => {
		if (redirectUri) {
			router.replace(redirectUri);
		} else {
			router.pop();
		}
	}, [router, redirectUri]);

	return (
		<BottomSheetModalProvider>
			<BottomSheetScrollView ref={scrollViewRef}>
				<EditAddressContent onCompleted={onCompleted} />
			</BottomSheetScrollView>
		</BottomSheetModalProvider>
	);
};
