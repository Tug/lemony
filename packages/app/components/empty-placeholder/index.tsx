import { useUser } from '../../hooks/use-user';
import { useNavigateToLogin } from '@diversifiedfinance/app/navigation/lib/use-navigate-to';
import { Button } from '@diversifiedfinance/design-system/button';
import { Text } from '@diversifiedfinance/design-system/text';
import { breakpoints } from '@diversifiedfinance/design-system/theme';
import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import { useWindowDimensions } from 'react-native';

type EmptyPlaceholderProps = {
	title?: string | JSX.Element;
	text?: string | JSX.Element;
	hideLoginBtn?: boolean;
	titleTw?: string;
	tw?: string;
};

const EmptyPlaceholder: React.FC<EmptyPlaceholderProps> = ({
	title = '',
	text = '',
	tw = '',
	titleTw = '',
	hideLoginBtn,
}) => {
	const { isAuthenticated } = useUser();
	const { width } = useWindowDimensions();
	const isMdWidth = width >= breakpoints.md;
	const navigateToLogin = useNavigateToLogin();

	return (
		<View tw={['items-center justify-center pt-4', tw]}>
			<Text
				tw={`text-lg font-extrabold text-gray-900 dark:text-gray-100 ${titleTw}`}
			>
				{title}
			</Text>
			{Boolean(text) && (
				<>
					<View tw="h-4" />
					<Text tw="text-sm text-gray-600 dark:text-gray-400">
						{text}
					</Text>
					<View tw="h-1" />
				</>
			)}
			{!isAuthenticated && !hideLoginBtn && (
				<>
					<View tw="h-4" />
					<Button
						onPress={() => {
							navigateToLogin();
						}}
						variant="primary"
						size={isMdWidth ? 'regular' : 'small'}
						labelTW="font-semibold"
					>
						Sign&nbsp;In
					</Button>
				</>
			)}
		</View>
	);
};

export { EmptyPlaceholder };