import { EmptyPlaceholder } from '@diversifiedfinance/app/components/empty-placeholder';
import { TextLink } from '@diversifiedfinance/app/navigation/link';
import { Text, View } from '@diversifiedfinance/design-system';
import React from 'react';

export default function Project404() {
	return (
		<View tw="items-center justify-center px-4 pt-8">
			<EmptyPlaceholder
				title="404 This project does not exist."
				text={
					<Text tw="text-center text-black dark:text-white">
						Try going back to the home page.&nbsp;
						<TextLink href={`/`} tw="text-primary-500">
							Go Home
						</TextLink>
					</Text>
				}
				hideLoginBtn
			/>
		</View>
	);
}
